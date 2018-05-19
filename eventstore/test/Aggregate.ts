// tslint:disable:no-unused-expression
import * as UUID from "uuid";
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import "mocha";
import { AggregateConfig, New, Active, Deleted, AggregateError } from "../src";
import { SnapshotInMemoryStore } from "./store/inmemory/SnapshotInmemoryStore";
import { JournalInMemoryStore } from "./store/inmemory/JournalInmemoryStore";

import { TestDataGenerator } from "./util/TestDataGenerator";
import { EntityAggregate } from "./sample/UserAggregate";
import { Entity } from "./sample/Entity";

const journalStore = new JournalInMemoryStore();
const snapshotStore = new SnapshotInMemoryStore();

const aggregateConfig: AggregateConfig = {
  snapshot: {
    interval: 10
  },
  stores: {
    journal: journalStore,
    snapshot: snapshotStore
  }
};

function aggregateTest() {
  describe("UserAggregate", () => {
    before(() => {
      chai.should();
      chai.use(chaiAsPromised);
    });

    it("should go through the life cycle", (done) => {
      const aggregateId = TestDataGenerator.randomUUID();
      const entityAggregate = new EntityAggregate(aggregateId, aggregateConfig);
      const createEntity = TestDataGenerator.randomCreateEntity();
      const getEntity = TestDataGenerator.randomGetEntity();
      const deleteEntity = TestDataGenerator.randomDeleteEntity();

      entityAggregate
        .rehydrate()
        .then((userState) => {
          userState.should.exist;
          userState.$state.should.be.equal(New.NAME);

          return entityAggregate.handle(getEntity);
        })
        .then((userState) => {
          userState.should.exist;
          userState.$state.should.be.equal(New.NAME);

          return entityAggregate.handle(createEntity);
        })
        .then((userState) => {
          userState.should.exist;
          userState.$state.should.be.equal(Active.NAME);

          const user = (userState as Active<Entity>).data;
          user.uuid.should.exist;
          user.uuid.should.be.equal(aggregateId);
          user.property1.should.exist;
          user.property1.should.be.equal(createEntity.property1);
          user.property2.should.exist;
          user.property2.should.be.equal(createEntity.property2);
          user.property3.should.exist;
          user.property3.should.be.equal(createEntity.property3);

          // get should return Active too
          return entityAggregate.handle(getEntity);
        })
        .then((userState) => {
          userState.should.exist;
          userState.$state.should.be.equal(Active.NAME);

          // delete user
          return entityAggregate.handle(deleteEntity);
        })
        .then((userState) => {
          userState.should.exist;
          userState.$state.should.be.equal(Deleted.NAME);
          return;
        })
        .then(done)
        .catch(done);
    });

    it("should reject a delete command on a new entity", (done) => {
      const aggregateId = TestDataGenerator.randomUUID();
      const entityAggregate = new EntityAggregate(aggregateId, aggregateConfig);
      const getEntity = TestDataGenerator.randomGetEntity();
      const deleteUser = TestDataGenerator.randomDeleteEntity();

      entityAggregate.rehydrate().then((userState) => {
        userState.should.exist;
        userState.$state.should.be.equal(New.NAME);

        entityAggregate.handle(deleteUser).should.be.rejected;
        done();
      });
    });

    it("should rehydrate from data store", (done) => {
      const aggregateId = TestDataGenerator.randomUUID();
      const entityAggregate = new EntityAggregate(aggregateId, aggregateConfig);
      const createEntity = TestDataGenerator.randomCreateEntity();
      const updateEntity = TestDataGenerator.randomUpdateEntity();
      const getEntity = TestDataGenerator.randomGetEntity();
      const deleteEntity = TestDataGenerator.randomDeleteEntity();

      entityAggregate
        .rehydrate()
        .then((userState) => {
          userState.should.exist;
          userState.$state.should.be.equal(New.NAME);

          return entityAggregate.handle(createEntity);
        })
        .then((userState) => {
          userState.should.exist;
          userState.$state.should.be.equal(Active.NAME);

          return entityAggregate.handle(updateEntity);
        })
        .then((userState) => {
          userState.should.exist;
          userState.$state.should.be.equal(Active.NAME);

          // create new aggregate that should rehydrate
          const userAggregate2 = new EntityAggregate(aggregateId, aggregateConfig);
          return userAggregate2.rehydrate();
        })
        .then((userState) => {
          userState.should.exist;
          userState.$state.should.be.equal(Active.NAME);

          // validate rehydrated entity
          const user = (userState as Active<Entity>).data;
          user.uuid.should.exist;
          user.uuid.should.be.equal(aggregateId);
          user.property1.should.exist;
          user.property1.should.be.equal(updateEntity.property1);
          user.property2.should.exist;
          user.property2.should.be.equal(updateEntity.property2);
          user.property3.should.exist;
          user.property3.should.be.equal(updateEntity.property3);

          return;
        })
        .then(done)
        .catch(done);
    });

    it("should reject a command that is not supported", (done) => {
      const aggregateId = TestDataGenerator.randomUUID();
      const entityAggregate = new EntityAggregate(aggregateId, aggregateConfig);
      const notSupportedCommand = TestDataGenerator.randomNotSupportedCommand();

      entityAggregate.rehydrate().then((userState) => {
        entityAggregate.handle(notSupportedCommand).should.be.rejected;
        done();
      });
    });
  });
}

export default aggregateTest;
