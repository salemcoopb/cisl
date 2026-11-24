LETs move to onboard customer. 
there are 3 types of accounts a user can open:
Individual account | joint account | corporate account. I’ll give you journeys for all. lets start with individual
Lets start with individual account


1.	Individual account
theres option to add new customer, or open account for existing customer
a) journey for add new customer:

•	fatca (foreign account tax compliance act information) declaration - basically needs to declare whether the new customer is us citizen or not (has a number of checkboxes to be checked)
•	personal information: full name (first, middle, surname) | identification details (id type, id number) | contact and tax infor (phone number, kra pin)
•	on clicking verify - runs a 3 checks (iprs, sanction, blacklist) - then informs done with check and tells whether successful, on each, or service not availabke etc, and if successful you can now continue to next step
•	id document photos: front id photo upload | back id photo upload, 
•	then clear photo of customer face - which is then verified agains the id, and is passes it proceeds to next step
•	next step now has all fields with the once we filled before autofilled here. i feel this is kinda confusing maybe we might need to refine but this is what it has: personal information (salutation, first name, middle name, last name, DOB, gender, nationality, identity number, country of residence) | contact details (email, alt email, comment box about the email, phone number, alt number, postal address, postal code, physical address, city) - here some are required with an asterisk some are not | employement details (occupation, monthly turnover dropdown, source of funds dropdown)
•	next of kin information: salutation, first name, middle name, last name, relationship, mobile number, email address. ypu can add more than one next of kin
•	tax exemption: are you exempted from tax, if no then nothing more, if yes then need to give certificate details: (certificate number, issue date, expiry date, upload document)
•	once submitted, we are now done with creating the customer. now we can create an investment account for the customer
•	there are 3 options for investment account: coop bond fund | coop money market fund | coop fixed income gratuity. we need to display these 4 key details for each of the account, for teh user to know before proceeding: minimum deposit eg Ksh 50,000 | tax on income eg 15 | minimum cash out eg ksh 1000 | currency which is ksh fro all teh 3 accounts.
•	
o	for all 3 accounts, opening process is same:
o	
	input invesment account name | ARO code lookup (optional ) - enter username > click fetch aro code > input ARO code
	Add withdrawal details. add primary and secondary is optional. can either be bank or mobile money - the exact same flow and details taht we had on edit investment account > withdrawal details. now, when adding a bank, on the select bank dropdown, if the user selects coop bank, they input there account number, and validate then it autofills account name and branch - because we have their data, since this platform is owned by coop bank - and tahts it, ones it validates , the account is open, just pending approval. but if they select a different bank other tahn cooperative bank, they will input all teh details manually: branch dropdown, account name, account number, bank code, swift code, branch code, postal address, postal code, country, city, address line - then once they input all this, they validate/verify. a pesalink hakikisha verification is done and if the account is verified they need to upload proof of ownership as well (bank statement or any proof of ownership) - then they can save and the process is done - of course we’d need a review screen that shows all the details for user to confirm before opneing account. To add mobile money is very simple. you just select mobile money provider from dropdown, then enter phone number, account name, upload proof of ownership (statement or any proof) and thats it you’re done - you can save and finish teh process
b) journey to open investment account for existing customer:

•	for existing customer, since we already have the customer details, we’ll skip the preliminary parts and jump straight to selecting an investment account to open for the customer. but first we need to be directed to the customers page . but we need to modify this customer page alittle bit: ie we dont need to have the drafts and pending approval tabs. we just want to see the list of customers. and on action column we need 2 actions. view and open account (so open account is a new cta we’ll add on this page, but everything else is just the customer page that we already have). so on this page a user can search customer by name, cif, id, email then they can choose to view details if they want, or open account. then when they click open account we get into the account opening jouney where they start by selecting the account type whether its bond, mmf, or gratuity. and from there the joueny is just similar to how the individual account opening is