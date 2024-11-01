think about implementing an authentication mechanism, to authenticate and store the accesstoken once the user is signup
to implement this feature we may need a frontend, which will redirect us to our backend


=> what's diff between hashing and encryption ? // password security thing

### database_design ==> normalization is good in terms of scalability, but query will take longer time to execute


configure hashi corp key-vault => user docer container initially

add more and more buy and sell strategies
rename the methods, we must be having only 2 method 1 for buy 1 for sell, having only a single method for both the transactions is optimal

think of the db structure for auditing, keeping the order data and user information
also need to think how can we use the order information append to demat table

--------------------------------------------------------------------------
Task 3: Data base
Audit table
Orders table
Holding table

Task 4:
Alert system trigger implementation, so that we can get an webhook call whenever there's an alert notification

Task 5:
Segregation of core logic in to Trading module. 
I will call the broker module methods only when they are absolutely needed. => this will make code more efficient. 

Task 6:
Compelte the order placement tasks

Task 7:
Complete all the well known strategies implementations

Task 8:
Make sure the logs are customised, so that all the logs get stored into the local file system.