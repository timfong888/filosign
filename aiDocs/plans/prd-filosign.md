## PRD

## Golden Path
The following is the golden path for the two Users: Sender and Recipient.
### Sender
1. Sender visits a web page
2. Signs in with their MetaMask Wallet
3. Uploads a PDF
4. Identifies the Recipient by Full Name and Ethereum Public Address
5. Presses "Sign and Upload"
6. Receives a "Retrieval ID" and instructions to email this to the desired recipient
7. Once it is signed, the section labeled "Signed Documents" shows the Retrieval ID, Date and Time of signature, Wallet Address of signee, Full Name
8. Clicking on the Link of the Retrieval ID takes User back to a page with a full Preview of the document

#### Recipient
1. Recipient receives a Retrieval ID through whatever means (email, but could be messenger)
2. Signs into the web page with their MetaMask Wallet
3. Sees a field where they can enter the "Retrieval ID"
4. (Maybe enters the senders public address as well)...
5. Presses Retrieve
6. If the information is correct, an unencrypted preview of the PDF is displayed
7. There's a "Sign Document" button
8. When pressing it, a signed transaction is completed with the MetaMask wallet
9. When signed, under Signed Documents shows: the Retrieval ID, Date and Time of signature, Wallet Address of signee, and Full Name
10. Clicking on the Link of the Retrieval ID takes User back to a page with a full Preview of the document


## UX
### Web Page
#### Overall Look and Feel
A modern SaaS page, similar to one of the one Vercel templates, that is clean, minimalist, modern.

It has a simple, bold title: "Secure Document Signing Powered by Filecoin"

#### Main Page
##### Wallet connect
There's a button in the upper left hand page which asks someone to "Connect their Wallet".

Once connect, there are two buttons underneath:
- Send Document
- Sign Received Document

#### Send Document Page

##### Upload Document
Once logged in, there's a single button that says, "Upload Document".

##### Your Document
Once the Document has been Uploaded, there's a Preview under the title "Your Document" of the PDF.

##### Document Recipient
There is beneath above the Document a section called "Document Recipient"

There is a box where someone puts the recipients Ethereum Address.
There's another form field for the person's full Legal Name.

##### Sign and Secure
There's a button that says "Sign and Secure".

##### Retrieval ID
After the button has been pressed, the document will be signed by the wallet, encrypted in a way that only the recipient with the private key of the recipient can open decrypt it, and some kind of a retrieval ID is returned.

Next to the Retrieval ID will be the date and time stamp, and the recipient's wallet, and the recipient's name.

#### Sign Received Document Page
This page shows up after the User pressed the "Sign Received Document" button from the `Main Page`.

There's a box that says, "Retrieval ID"
Underneath, it will say, "Make sure that you are using the same Wallet Address that your sender said they have used."

There's a button that says, "Retrieval Document".

After pressing the button, the encrypted file will be retrieved, and then decrypted based on the private key of the wallet.

The unencrypted file will be displayed.

###### Sign Document
Beneath the preview of the PDF will be a "Sign Document" button.

Doing so will require the user to sign a transaction with their MetaMask (or other Wallet), indicating that this particular document has been received and signed and put onto the blockchain with a signed event.

Under the section "Signed Retrievals" will list:
- Retrieval ID
- Date and Time Signed
- Wallet Address of the Sender
- Name of the Sender


