import { Router } from 'express';
import authRouter from './auth.routes';
import projectRouter from './project.routes';
import lookupRouter from './lookup.routes'; // <-- IMPORTAR NUEVO ROUTER
// import userRouter from './user.routes'; // Descomentar cuando existan

const mainRouter = Router();

mainRouter.use('/auth', authRouter);
mainRouter.use('/projects', projectRouter);
mainRouter.use('/lookups', lookupRouter); // <-- USAR NUEVO ROUTER
// mainRouter.use('/users', userRouter); // Descomentar cuando existan

export default mainRouter;