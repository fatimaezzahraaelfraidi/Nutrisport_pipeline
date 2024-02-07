import { PaymentController } from "./controller/PaymentController"

export const Routes = [{
    method: "post",
    route: "/payments/intents",
    controller: PaymentController,
    action: "paymentIntent"
}]