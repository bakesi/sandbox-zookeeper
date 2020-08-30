const zookeeper = require('node-zookeeper-client');

const client = zookeeper.createClient('localhost:2181');
const command = process.argv[2];
const path = process.argv[3];
const data = process.argv[4];

console.log('command:', command);
console.log('path:', path);
console.log('data:', data);

client.once('connected', () => {
  console.log('connnected to the server');

  switch (command) {
    case 'create':
      create(client, path, data);
      break;
    case 'set':
      set(client, path, data);
    case 'children':
      listChildren(client, path, data);
      break;
    default:
      read(client, path);
  }

});

function create(client, path, data) {
  client.create(
    path, Buffer.from(data),
    zookeeper.CreateMode.EPHEMERAL,
    (error, path) => {
      if (error) {
        console.error(error.message, error.stack, error);
        return;
      }
      console.log('Node: %s is created', path);
    }
  );
}

function read(client, path) {
  client.getData(
    path,
    (event) => console.log('Read event: ', event),
    (error, data) => {
      if (error) {
        console.error(error);
        return;
      }

      console.log('Read data:', data.toString('utf8'));
    }
  );
}

function listChildren(client, path) {
  client.listSubTreeBFS(
    path,
    (error, children, stat) => {
      if (error) {
        console.log(
          'Failed to list children of %s due to: %s.',
          path,
          error
        );
        return;
      }

      console.log('Children of %s are: %j.', path, children);
    }
  );
}

function set(client, path, data) {
  client.setData(
    path, Buffer.from(data),
    (error, stat) => {
      if (error) {
        console.error(error.message, error.stack);
        return;
      }
      console.log('Node: %s is updated', path);
    }
  );
}

client.connect();

process.on('SIGINT', () => {
  console.log('Close conneciton');
  client.close();
})
