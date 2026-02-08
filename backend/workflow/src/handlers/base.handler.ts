import { type Database } from '../db/index.js';
import { type ActionPayload } from '../types/workflow.type.js';

export interface ActionHandler<T extends ActionPayload = ActionPayload> {
  validate(payload: T): Promise<void>;
  execute(db: Database, payload: T): Promise<any>;
}

export abstract class BaseActionHandler<T extends ActionPayload = ActionPayload> implements ActionHandler<T> {
  abstract validate(payload: T): Promise<void>;
  abstract execute(db: Database, payload: T): Promise<any>;
}
