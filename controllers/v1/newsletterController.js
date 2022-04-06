
const newsletter = require('./newsletterController')

const sgClient = require("@sendgrid/client");
sgClient.setApiKey(process.env.SENDGRID_API_KEY);

const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.randNum = () => 
{
  return Math.floor(Math.random() * 90000) + 10000;
}

exports.addContact = async(email, confNum) =>
{
  const customFieldID = await newsletter.getCustomFieldID('conf_num');
  
  const data = {
    "contacts": [
      {
        "email": email,
        "custom_fields": {}
      }
    ]
  };

  data.contacts[0].custom_fields[customFieldID] = confNum;

  const request = 
  {
    url: `/v3/marketing/contacts`,
    method: 'PUT',
    body: data
  }
  
  return sgClient.request(request);
}

exports.getCustomFieldID = async(customFieldName) =>
{
  const request = {
    url: `/v3/marketing/field_definitions`,
    method: 'GET',
  }
  const response = await sgClient.request(request);
  const allCustomFields = response[1].custom_fields;
  return allCustomFields.find(x => x.name === customFieldName).id;
}


exports.getContactByEmail= async(email) => 
{
  const data = 
  {
    "emails": [email]
  };

  const request = 
  {
    url: `/v3/marketing/contacts/search/emails`,
    method: 'POST',
    body: data
  }
  const response = await sgClient.request(request);
  
  if(response[1].result[email]) return response[1].result[email].contact;
  else return null;
}

exports.getListID = async(listName) => 
{
  const request = 
  {
    url: `/v3/marketing/lists`,
    method: 'GET',
  }

  const response = await sgClient.request(request);
  const allLists = response[1].result;
  return allLists.find(x => x.name === listName).id;
}

exports.addContactToList = async(email, listID) =>
{
  const data = 
  {
    "list_ids": [listID],
    "contacts": [
      {
      "email": email
      }
    ]
  };

  const request = 
  {
    url: `/v3/marketing/contacts`,
    method: 'PUT',
    body: data
  }
  return sgClient.request(request);
}

exports.sendNewsletterToList = async(req, listID, next) =>
{
  try
  {
    const data = 
      {
        "query": `CONTAINS(list_ids, '${listID}')`
      };

    const request = 
      {
        url: `/v3/marketing/contacts/search`,
        method: 'POST',
        body: data
      }

    const response = await sgClient.request(request);

    for (const subscriber of response[1].result) 
    {
      const params = new URLSearchParams(
        {
          conf_num: subscriber.custom_fields.conf_num,
          email: subscriber.email,
        }
      );
      
      const unsubscribeURL = `${req.protocol}://${req.headers.host}/v1/newsletter/delete/?${params}`;

      const msg = 
      {
        to: subscriber.email, // Change to your recipient
        from: 
        {
          email: "nutritivshop@gmail.com",
          name : "Nutritiv"
        },
        templateId: 'd-eb9794ff73114728aa4b3686e240dbeb',
        dynamicTemplateData: 
        {
          unsubscribe: unsubscribeURL
        }
      }
      
      sgMail.send(msg);
    }
  }catch(err){next(err)}
}

exports.deleteContactFromList = async(listID, contact) =>
{
  const request = 
  {
    url: `/v3/marketing/lists/${listID}/contacts`,
    method: 'DELETE',
    qs: 
    {
      "contact_ids": contact.id
    }
  }
  await sgClient.request(request);
}
