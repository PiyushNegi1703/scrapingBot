import User from "../models/user.model.js";

// Creating a type definition for the data that we are going to send to hubspot
type UserInHubspot = {
  email: string;
  properties: [
    // These properties are the predefined ones in hubspot so using them to send the data
    { property: "firstname"; value: string },
    { property: "gender"; value: string }
  ];
};

async function addUsersToHubspot(users: User[], hubspotApiKey: string) {
  // The endpoint to send the data to hubspot
  const endpoint = "https://api.hubapi.com/contacts/v1/contact/batch";
  let results: UserInHubspot[] = []; // Creating an array to store the data that we are going to send to hubspot

  for (let i = 0; i < 100; i++) {
    // Destructuring the data from the users array
    const { id, name, sex } = users[i];
    results.push({
      email: `test${id}@gmail.com`,
      properties: [
        { property: "firstname", value: name },
        { property: "gender", value: sex },
      ],
    });
  }

  // The options to send the data to hubspot
  const options = {
    method: "POST",
    url: endpoint,
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${hubspotApiKey}`,
    },
    body: JSON.stringify(results),
  };

  // Sending the data to hubspot
  fetch(`${options.url}`, {
    method: options.method,
    headers: options.headers,
    body: options.body,
  })
    .then((response) => {
      console.log(response.status);
    })
    .catch((error) => {
      console.error(error);
    });
}

export default addUsersToHubspot;
