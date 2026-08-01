declare class SSLCommerzPayment {
  constructor(store_id: string, store_pass: string, is_live: boolean)
  init(data: Record<string, unknown>): Promise<{
    status: string
    GatewayPageURL: string
    sessionkey: string
    [key: string]: unknown
  }>
  validate(data: { val_id: string }): Promise<{
    status: string
    [key: string]: unknown
  }>
}

export = SSLCommerzPayment