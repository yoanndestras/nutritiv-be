const router = require("express").Router();

const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// CONTROLLERS
const cors = require('../../controllers/v1/corsController');
const newsletter = require('../../controllers/v1/newsletterController')
const {uploadHtml} = require('./upload');

//OPTIONS FOR CORS CHECK
router.options("*", cors.corsWithOptions, (req, res) => { res.sendStatus(200); })

// router.get('/signup', (req, res) => 
// {
//   res.render('form', signUpPage);
// });

router.get('/confirm', async(req, res, next) => 
{
  try 
  {
    const contact = await newsletter.getContactByEmail(req.query.email);

    if(contact == null) throw `Contact not found.`;
    
    if (contact.custom_fields.conf_num ==  req.query.conf_num) 
    {
      const listID = await newsletter.getListID('Newsletter Subscribers');
      await newsletter.addContactToList(req.query.email, listID);
    } 
    else 
    {
      let err = new Error('Confirmation number does not match');
      err.statusCode = 404;
      next(err);
    }
    
    res.status(200).json(
      {
          success: true,
          message: 'You are now subscribed to our newsletter. We can\'t wait for you to hear from us!'
      });

  } 
  catch(err) 
  {
    err.message = 'Subscription was unsuccessful. Please try again in a few seconds to click the link.</a>';
    next(err);
  }
});

router.post('/signup', async(req, res, next) => 
{
  try
  {
    const confNum = newsletter.randNum();
    
    const params = new URLSearchParams(
      {
        conf_num: confNum,
        email: req.body.email,
      });
      
    const confirmationURL = req.protocol + '://' + req.headers.host + '/v1/newsletter/confirm/?' + params;
  
    const msg = 
      {
        to: req.body.email,
        from: 'nutritivshop@gmail.com', // Change to your verified sender
        subject: `Confirm your subscription to our newsletter`,
        html: `Hello ,<br>Thank you for subscribing to our newsletter. Please complete and confirm your subscription by <a href="${confirmationURL}"> clicking here</a>.`
      }
  
      await newsletter.addContact(req.body.email, confNum);
      await sgMail.send(msg);
  
      res.status(201).json(
        {
            success: true,
            message: 'Thank you for signing up for our newsletter! Please complete the process by confirming the subscription in your email inbox.'
        });

  }catch(err){next(err)}
});

router.post('/upload', async (req, res, next) => 
{
  const listID = await newsletter.getListID('Newsletter Subscribers');
  
  await newsletter.sendNewsletterToList(req, listID, next)
  
  res.status(201).json(
    {
        success: true,
        message: 'Newsletter has been sent to all subscribers.'
    });
});

router.get('/delete', async (req, res, next) => 
{
  try 
  {
    const contact = await newsletter.getContactByEmail(req.query.email);
    if(contact == null) throw `Contact not found.`;

    if (contact.custom_fields.conf_num ==  req.query.conf_num) 
    {
      const listID = await newsletter.getListID('Newsletter Subscribers');
      await newsletter.deleteContactFromList(listID, contact);

      res.status(200).json(
        {
            success: true,
            message: 'You have been successfully unsubscribed. If this was a mistake re-subscribe <a href="/signup">here</a>.'
        });
    }
    else 
    {
      let err = new Error('Confirmation number does not match or contact is not subscribed')
      err.statusCode = 400; 
      next(err);
    }
  }
  catch(err) 
  {
    err.message = 'Email could not be unsubscribed. please try again.';
    next(err);
  }
});


module.exports = router;