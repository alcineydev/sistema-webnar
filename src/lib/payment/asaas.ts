const ASAAS_API_URL =
  process.env.ASAAS_ENV === "production"
    ? "https://api.asaas.com/v3"
    : "https://sandbox.asaas.com/api/v3"

const ASAAS_API_KEY = process.env.ASAAS_API_KEY

export interface AsaasCustomer {
  id?: string
  name: string
  email: string
  cpfCnpj?: string
  phone?: string
  mobilePhone?: string
  postalCode?: string
  address?: string
  addressNumber?: string
  complement?: string
  province?: string
  externalReference?: string
}

export interface AsaasSubscription {
  id?: string
  customer: string
  billingType: "BOLETO" | "CREDIT_CARD" | "PIX" | "UNDEFINED"
  value: number
  nextDueDate: string
  cycle: "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "QUARTERLY" | "SEMIANNUALLY" | "YEARLY"
  description?: string
  externalReference?: string
}

export interface AsaasPayment {
  id: string
  customer: string
  value: number
  netValue: number
  status: string
  billingType: string
  dueDate: string
  paymentDate?: string
  invoiceUrl?: string
  bankSlipUrl?: string
  pixQrCodeUrl?: string
  pixCopiaECola?: string
}

class AsaasClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (!ASAAS_API_KEY) {
      throw new Error("ASAAS_API_KEY nao configurada")
    }

    const response = await fetch(`${ASAAS_API_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        access_token: ASAAS_API_KEY,
        ...options.headers,
      },
      cache: "no-store",
    })

    if (!response.ok) {
      const error = (await response.json().catch(() => ({}))) as {
        errors?: { description?: string }[]
      }
      throw new Error(error.errors?.[0]?.description || "Erro na API Asaas")
    }

    return response.json() as Promise<T>
  }

  async createCustomer(data: AsaasCustomer): Promise<AsaasCustomer> {
    return this.request<AsaasCustomer>("/customers", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async getCustomer(id: string): Promise<AsaasCustomer> {
    return this.request<AsaasCustomer>(`/customers/${id}`)
  }

  async getCustomerByEmail(email: string): Promise<AsaasCustomer | null> {
    const response = await this.request<{ data: AsaasCustomer[] }>(
      `/customers?email=${encodeURIComponent(email)}`
    )
    return response.data[0] || null
  }

  async updateCustomer(id: string, data: Partial<AsaasCustomer>): Promise<AsaasCustomer> {
    return this.request<AsaasCustomer>(`/customers/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async createSubscription(data: AsaasSubscription): Promise<AsaasSubscription> {
    return this.request<AsaasSubscription>("/subscriptions", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async getSubscription(id: string): Promise<AsaasSubscription> {
    return this.request<AsaasSubscription>(`/subscriptions/${id}`)
  }

  async updateSubscription(
    id: string,
    data: Partial<AsaasSubscription>
  ): Promise<AsaasSubscription> {
    return this.request<AsaasSubscription>(`/subscriptions/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async cancelSubscription(id: string): Promise<void> {
    await this.request(`/subscriptions/${id}`, {
      method: "DELETE",
    })
  }

  async getSubscriptionPayments(id: string): Promise<{ data: AsaasPayment[] }> {
    return this.request<{ data: AsaasPayment[] }>(`/subscriptions/${id}/payments`)
  }

  async getPayment(id: string): Promise<AsaasPayment> {
    return this.request<AsaasPayment>(`/payments/${id}`)
  }

  async getPaymentPixQrCode(id: string): Promise<{ encodedImage: string; payload: string }> {
    return this.request<{ encodedImage: string; payload: string }>(`/payments/${id}/pixQrCode`)
  }

  async refundPayment(id: string, value?: number): Promise<void> {
    await this.request(`/payments/${id}/refund`, {
      method: "POST",
      body: JSON.stringify(value ? { value } : {}),
    })
  }
}

export const asaas = new AsaasClient()

export function mapAsaasStatus(status: string): string {
  const statusMap: Record<string, string> = {
    PENDING: "pending",
    RECEIVED: "confirmed",
    CONFIRMED: "confirmed",
    OVERDUE: "overdue",
    REFUNDED: "refunded",
    RECEIVED_IN_CASH: "confirmed",
    REFUND_REQUESTED: "refunded",
    CHARGEBACK_REQUESTED: "refunded",
    CHARGEBACK_DISPUTE: "refunded",
    AWAITING_CHARGEBACK_REVERSAL: "pending",
    DUNNING_REQUESTED: "overdue",
    DUNNING_RECEIVED: "confirmed",
    AWAITING_RISK_ANALYSIS: "pending",
  }

  return statusMap[status] || "pending"
}

export function mapBillingCycle(cycle: string): AsaasSubscription["cycle"] {
  const cycleMap: Record<string, AsaasSubscription["cycle"]> = {
    monthly: "MONTHLY",
    quarterly: "QUARTERLY",
    yearly: "YEARLY",
  }
  return cycleMap[cycle] || "MONTHLY"
}
