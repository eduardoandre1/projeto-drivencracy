import { Router } from "express";
import poll from "./poll.js";
import choices from "./choices.js";
import votes from "./votes.js";

const router = Router()
router.use(poll)
router.use(choices)
router.use(votes)

export default router