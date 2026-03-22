import { ASSISTANT_NAME } from "../constants/assistantBrand";
import type {
  JarvisAction,
  JarvisActionExecutionContext,
  JarvisFlightRequest,
} from "./jarvisActionTypes";

export abstract class BaseJarvisAction implements JarvisAction {
  constructor(public readonly id: string) {}

  abstract run(context: JarvisActionExecutionContext): Promise<void>;
}

export class JarvisFlyToTargetAction extends BaseJarvisAction {
  constructor(
    id: string,
    private readonly request: JarvisFlightRequest
  ) {
    super(id);
  }

  async run(context: JarvisActionExecutionContext) {
    await context.runFlight(this.request);
  }
}

export class JarvisTypingAction extends BaseJarvisAction {
  constructor(
    id: string,
    private readonly durationMs: number,
    private readonly label = `${ASSISTANT_NAME} esta escribiendo...`
  ) {
    super(id);
  }

  async run(context: JarvisActionExecutionContext) {
    await context.showTyping({
      durationMs: this.durationMs,
      label: this.label,
    });
  }
}

export class JarvisRevealMessageAction extends BaseJarvisAction {
  constructor(
    id: string,
    private readonly messageId: string,
    private readonly settleDelayMs = 180
  ) {
    super(id);
  }

  async run(context: JarvisActionExecutionContext) {
    context.revealMessage(this.messageId);
    await context.wait(this.settleDelayMs);
  }
}
