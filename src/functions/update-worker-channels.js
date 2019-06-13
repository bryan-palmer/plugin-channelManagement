exports.handler = function(context, event, callback) {
  const response = new Twilio.Response();
  
  response.appendHeader("Access-Control-Allow-Origin", "*");
  response.appendHeader("Access-Control-Allow-Methods", "OPTIONS POST");
  response.appendHeader("Content-Type", "application/json");
  response.appendHeader("Access-Control-Allow-Headers", "Content-Type");

  const client = context.getTwilioClient();
  const channels = JSON.parse(event.channels);
  const WorkspaceSid = context.TWILIO_WORKSPACE_SID;
  const WorkerSid = event.WorkerSid;

  // add the channels that you want to return
  // make sure to apply the same filtering to `update-worker-channels`
  // value: taskChannelUniqueName 
  let channelsFilter = ['sms','chat','voice'];
  
  const promises = channels.map(channel => {
    return new Promise((resolve, reject) => {
      client.taskrouter
        .workspaces(WorkspaceSid)
        .workers(WorkerSid)
        .workerChannels(channel.name)
        .update({
          capacity: channel.capacity,
          available: channel.isAvailable
        })
        .then(result => {
          console.log(result, "result");
          resolve(result);
        })
        .catch(error => {
          console.log(error, "error");
          reject(error);
        });
    });
  });

  Promise.all(promises).then( data => {
    client.taskrouter
      .workspaces(WorkspaceSid)
      .workers(WorkerSid)
      .workerChannels.list()
      .then(result => {
        console.log(result);

        let filteredResult = [];
            
        result.forEach( c => {
            if( channelsFilter.includes(c.taskChannelUniqueName) ) {
                filteredResult.push(c);
            }
        });

        response.body = filteredResult;
        
        callback(null, response);
      })
      .catch(error => {
        console.log(error);
        callback(error);
      });
  });
};

