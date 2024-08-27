think about implementing an authentication mechanism, to authenticate and store the accesstoken once the user is signup
to implement this feature we may need a frontend, which will redirect us to our backend


=> what's diff between hashing and encryption ? // password security thing

### database_design ==> normalization is good in terms of scalability, but query will take longer time to execute


configure hashi corp key-vault => user docer container initially

add more and more buy and sell strategies
rename the methods, we must be having only 2 method 1 for buy 1 for sell, having only a single method for both the transactions is optimal

think of the db structure for auditing, keeping the order data and user information
also need to think how can we use the order information append to demat table

Task 1:
1. figure out the proper way of DTO mapping in nest either using class transformer or some other module, I dont care, but mapping needs to be implemented as early as possible


Task 2:
1 seperate module to fetch stocks historical information, be it daily, weekly, hourly, 5 mins, 15 mins data

Task 3: Data base
Audit table
Orders table
Holding table

Task 4:
Alert system trigger implementation, so that we can get an webhook call whenever there's an alert notification