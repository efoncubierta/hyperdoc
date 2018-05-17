import { User } from "./entity/User";
import { GetUserCommand } from "./message/GetUserCommand";
import { CreateUserCommand } from "./message/CreateUserCommand";
import { UserCreatedEvent } from "./message/UserCreatedEvent";

import { New, Aggregate, Active, Deleted, AggregateConfig, Snapshot } from "../../src";

export type UserCommand = GetUserCommand | CreateUserCommand;
export type UserEvent = UserCreatedEvent;
export type UserState = New<User> | Active<User> | Deleted<User>;

export class UserAggregate extends Aggregate<User, UserState, UserCommand, UserEvent> {
  private readonly uuid: string;
  private state: UserState = new New();

  /**
   * Constructor.
   *
   * @param uuid - User UUID
   * @param config - Aggregate configuration
   */
  constructor(uuid: string, config: AggregateConfig) {
    super(config);
    this.uuid = uuid;
  }

  public handle(command: UserCommand): Promise<UserState> {
    switch (command.$command) {
      case GetUserCommand.NAME:
        return Promise.resolve(this.currentState());
      case CreateUserCommand.NAME:
        return this.createUser(command as CreateUserCommand);
      default:
        return Promise.reject(`Command ${command.$command} not supported by UserAggregate.`);
    }
  }

  protected aggregateId(): string {
    return this.uuid;
  }

  protected currentState(): UserState {
    return this.state;
  }

  protected aggregateEvent(event: UserEvent) {
    switch (event.$event) {
      case UserCreatedEvent.NAME:
        const user: User = {
          uuid: event.aggregateId,
          username: event.username,
          email: event.email
        };
        this.state = new Active(user);
        break;
      default:
      // TODO handle error
    }
  }

  protected aggregateSnapshot(snapshot: Snapshot<UserState>) {
    this.state = snapshot.state;
  }

  private createUser(command: CreateUserCommand): Promise<UserState> {
    switch (this.state.$state) {
      case New.NAME:
        return this.save(new UserCreatedEvent(this.aggregateId(), command.username, command.email)).then((event) => {
          this.aggregateEvent(event);
          return this.currentState();
        });
      default:
        return Promise.reject(`User ${this.aggregateId()} already exists.`);
    }
  }
}
