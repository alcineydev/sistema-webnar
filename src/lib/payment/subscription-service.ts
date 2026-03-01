import { addDays, addMonths } from "date-fns"
import { prismaMaster } from "@/lib/db/master"
import { asaas, mapAsaasStatus, mapBillingCycle } from "./asaas"

interface CreateSubscriptionParams {
  tenantId: string
  planId: string
  billingCycle: "monthly" | "quarterly" | "yearly"
  customerData: {
    name: string
    email: string
    cpfCnpj?: string
    phone?: string
  }
}

export async function createSubscription(params: CreateSubscriptionParams) {
  const { tenantId, planId, billingCycle, customerData } = params

  const plan = await prismaMaster.plan.findUnique({
    where: { id: planId },
  })

  if (!plan) {
    throw new Error("Plano nao encontrado")
  }

  let value: number
  switch (billingCycle) {
    case "quarterly":
      value = plan.priceQuarterly || plan.priceMonthly * 3
      break
    case "yearly":
      value = plan.priceYearly || plan.priceMonthly * 12
      break
    default:
      value = plan.priceMonthly
  }

  let asaasCustomer = await asaas.getCustomerByEmail(customerData.email)
  if (!asaasCustomer) {
    asaasCustomer = await asaas.createCustomer({
      name: customerData.name,
      email: customerData.email,
      cpfCnpj: customerData.cpfCnpj,
      phone: customerData.phone,
      externalReference: tenantId,
    })
  }

  if (!asaasCustomer.id) {
    throw new Error("Cliente Asaas invalido")
  }

  const nextDueDate = addDays(new Date(), 1).toISOString().split("T")[0]
  const asaasSubscription = await asaas.createSubscription({
    customer: asaasCustomer.id,
    billingType: "UNDEFINED",
    value,
    nextDueDate,
    cycle: mapBillingCycle(billingCycle),
    description: `Plano ${plan.name} - Webinar Hub`,
    externalReference: tenantId,
  })

  const periodMonths = billingCycle === "yearly" ? 12 : billingCycle === "quarterly" ? 3 : 1
  const currentPeriodEnd = addMonths(new Date(), periodMonths)

  const subscription = await prismaMaster.subscription.create({
    data: {
      tenantId,
      planId,
      asaasCustomerId: asaasCustomer.id,
      asaasSubscriptionId: asaasSubscription.id,
      status: "pending",
      billingCycle,
      currentPeriodStart: new Date(),
      currentPeriodEnd,
    },
  })

  return {
    subscription,
    asaasSubscription,
  }
}

export async function cancelSubscription(subscriptionId: string) {
  const subscription = await prismaMaster.subscription.findUnique({
    where: { id: subscriptionId },
  })

  if (!subscription) {
    throw new Error("Assinatura nao encontrada")
  }

  if (subscription.asaasSubscriptionId) {
    await asaas.cancelSubscription(subscription.asaasSubscriptionId)
  }

  await prismaMaster.subscription.update({
    where: { id: subscriptionId },
    data: {
      status: "cancelled",
      cancelledAt: new Date(),
    },
  })

  await prismaMaster.tenant.update({
    where: { id: subscription.tenantId },
    data: { status: "cancelled" },
  })
}

export async function processPaymentWebhook(
  asaasPaymentId: string,
  status: string,
  value: number,
  netValue: number
) {
  let payment = await prismaMaster.payment.findUnique({
    where: { asaasPaymentId },
    include: { subscription: true },
  })

  const mappedStatus = mapAsaasStatus(status)

  if (payment) {
    payment = await prismaMaster.payment.update({
      where: { id: payment.id },
      data: {
        status: mappedStatus,
        netAmount: netValue,
        paymentDate: mappedStatus === "confirmed" ? new Date() : null,
      },
      include: { subscription: true },
    })
  } else {
    const asaasPayment = await asaas.getPayment(asaasPaymentId)

    const subscription = await prismaMaster.subscription.findFirst({
      where: { asaasCustomerId: asaasPayment.customer },
    })

    if (subscription) {
      payment = await prismaMaster.payment.create({
        data: {
          subscriptionId: subscription.id,
          asaasPaymentId,
          amount: value,
          netAmount: netValue,
          status: mappedStatus,
          billingType: asaasPayment.billingType,
          dueDate: new Date(asaasPayment.dueDate),
          paymentDate: mappedStatus === "confirmed" ? new Date() : null,
          source: "asaas",
        },
        include: { subscription: true },
      })
    }
  }

  if (payment?.subscription) {
    const newSubscriptionStatus =
      mappedStatus === "confirmed"
        ? "active"
        : mappedStatus === "overdue"
          ? "overdue"
          : payment.subscription.status

    await prismaMaster.subscription.update({
      where: { id: payment.subscription.id },
      data: { status: newSubscriptionStatus },
    })

    const tenantStatus =
      newSubscriptionStatus === "active"
        ? "active"
        : newSubscriptionStatus === "overdue"
          ? "suspended"
          : "active"

    await prismaMaster.tenant.update({
      where: { id: payment.subscription.tenantId },
      data: { status: tenantStatus },
    })
  }

  return payment
}
