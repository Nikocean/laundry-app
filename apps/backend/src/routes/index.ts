import { Router } from "express";
import { authRouter } from "./auth.routes";
import { userRouter } from "./user.routes";
import { addressRouter } from "./address.routes";
import { orderRouter } from "./order.routes";
import { courierRouter } from "./courier.routes";
import { notificationRouter } from "./notification.routes";
import { paymentRouter } from "./payment.routes";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/users", userRouter);
apiRouter.use("/addresses", addressRouter);
apiRouter.use("/orders", orderRouter);
apiRouter.use("/couriers", courierRouter);
apiRouter.use("/notifications", notificationRouter);
apiRouter.use("/payments", paymentRouter);
