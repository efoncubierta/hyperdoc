import { Entity, EntityBuilder } from "./Entity";
import { GetEntity } from "./GetEntity";
import { CreateEntity } from "./CreateEntity";
import { UpdateEntity } from "./UpdateEntity";
import { DeleteEntity } from "./DeleteEntity";
import { EntityCreated } from "./EntityCreated";
import { EntityDeleted } from "./EntityDeleted";
import { EntityUpdated } from "./EntityUpdated";

import { New, Aggregate, Active, Deleted, AggregateConfig, Snapshot, AggregateError } from "../../src";

export type EntityCommand = GetEntity | CreateEntity | UpdateEntity | DeleteEntity;
export type EntityEvent = EntityCreated | EntityDeleted | EntityUpdated;
export type EntityState = New<Entity> | Active<Entity> | Deleted<Entity>;

export class EntityAggregate extends Aggregate<Entity, EntityState, EntityCommand, EntityEvent> {
  private state: EntityState = new New();

  /**
   * Constructor.
   *
   * @param uuid - Entity UUID
   * @param config - Aggregate configuration
   */
  constructor(uuid: string, config: AggregateConfig) {
    super(uuid, config);
  }

  protected currentState(): EntityState {
    return this.state;
  }

  public handle(command: EntityCommand): Promise<EntityState> {
    switch (command.$command) {
      case GetEntity.NAME:
        return this.handleGetEntity(command as GetEntity);
      case CreateEntity.NAME:
        return this.handleCreateEntity(command as CreateEntity);
      case UpdateEntity.NAME:
        return this.handleUpdateEntity(command as UpdateEntity);
      case DeleteEntity.NAME:
        return this.handleDeleteEntity(command as DeleteEntity);
      default:
        return Promise.reject(new Error(`Command ${command.$command} not supported by EntityAggregate.`));
    }
  }

  private handleGetEntity(command: GetEntity): Promise<EntityState> {
    return Promise.resolve(this.currentState());
  }

  private handleCreateEntity(command: CreateEntity): Promise<EntityState> {
    switch (this.state.$state) {
      case New.NAME:
        return this.save(
          new EntityCreated(
            this.aggregateId,
            this.getNextSequence(),
            command.property1,
            command.property2,
            command.property3
          )
        ).then((event) => {
          this.aggregateEvent(event);
          return this.currentState();
        });
      default:
        return Promise.reject(new Error(`Entity ${this.aggregateId} already exists.`));
    }
  }

  private handleUpdateEntity(command: UpdateEntity): Promise<EntityState> {
    switch (this.state.$state) {
      case Active.NAME:
        return this.save(
          new EntityUpdated(
            this.aggregateId,
            this.getNextSequence(),
            command.property1,
            command.property2,
            command.property3
          )
        ).then((event) => {
          this.aggregateEvent(event);
          return this.currentState();
        });
      default:
        return Promise.reject(new Error(`Can't change the email on a non-existent or deleted node.`));
    }
  }

  private handleDeleteEntity(command: DeleteEntity): Promise<EntityState> {
    switch (this.state.$state) {
      case Active.NAME:
        return this.save(new EntityDeleted(this.aggregateId, this.getNextSequence())).then((event) => {
          this.aggregateEvent(event);
          return this.currentState();
        });
      default:
        return Promise.reject(new Error(`Entity ${this.aggregateId} doesn't exist and cannot be deleted`));
    }
  }

  protected aggregateSnapshot(snapshot: Snapshot) {
    this.state = snapshot.state;
  }

  protected aggregateEvent(event: EntityEvent) {
    switch (event.$event) {
      case EntityCreated.NAME:
        this.aggregateEntityCreated(event as EntityCreated);
        break;
      case EntityUpdated.NAME:
        this.aggregateEntityUpdated(event as EntityUpdated);
        break;
      case EntityDeleted.NAME:
        this.aggregateEntityDeleted(event as EntityDeleted);
        break;
      default:
        return Promise.reject(new Error(`Event ${event.$event} not supported by EntityAggregate.`));
    }
  }

  private aggregateEntityCreated(event: EntityCreated) {
    const entity = new EntityBuilder()
      .uuid(event.$aggregateId)
      .property1(event.property1)
      .property2(event.property2)
      .property3(event.property3)
      .build();
    this.state = new Active(entity);
  }

  private aggregateEntityUpdated(event: EntityUpdated) {
    const entity = new EntityBuilder((this.state as Active<Entity>).data)
      .property1(event.property1)
      .property2(event.property2)
      .property3(event.property3)
      .build();
    this.state = new Active(entity);
  }

  private aggregateEntityDeleted(event: EntityDeleted) {
    const entity = (this.state as Active<Entity>).data;
    this.state = new Deleted(entity);
  }
}
