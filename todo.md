think about implementing an authentication mechanism, to authenticate and store the accesstoken once the user is signup
to implement this feature we may need a frontend, which will redirect us to our backend


=> what's diff between hashing and encryption ? // password security thing

### database_design ==> normalization is good in terms of scalability, but query will take longer time to execute


add more and more buy and sell strategies
rename the methods, we must be having only 2 method 1 for buy 1 for sell, having only a single method for both the transactions is optimal

think of the db structure for auditing, keeping the order data and user information
also need to think how can we use the order information append to demat table

--------------------------------------------------------------------------
- [ ] Task 5:
Fix the typeOrm code, which is breaking in some save update operations.

- [ ] Task 7:
Complete all the well known strategies implementations

- [ ] Task 8:
think of some cheapest but secure way to deploy the application. ==> Linode

- [ ] Task 9:
Implement retry mechanism for api calls ==> test the code

- [ ] Task 10:
Enhance the error handling in request handler files.

- [ ] Task 12:
Explore event triggers

- [ ] Task 13:
Integrate google sheets

- [ ] Task 14:
call some auth-less scanner GET apis to get the data regularly

- [ ] Task 15:
start analysing flat trade, code base, I need to integrate that BROKER as well.

- [ ] Task 3: Data base
Audit table
Orders table
Holding table

- [ ] TASK 16:
[NSE 52 WEEK HIGH API](https://www.nseindia.com/api/live-analysis-data-52weekhighstock)
TrendLyne => Free API
[TRENDLYNE IPO SCANNER](https://trendlyne.com/ipo/api/screener/year/2024/)

- [ ] Task 16:
start writing test cases for end to end testing.

- [ ] Task 17:
A new api in trading controller, which is able to read files in csv or xslx format and update the order, holding tables.

- [ ] Task 18:
while calculating historical and curent stock data, we are using so many numbers as constant, make sure you create a seperate file and put those numbers as constant.

- [ ] task 19:
implement worker thread using picsana for getHistoricalData and getCurrentData

- [ ] task 20:
make sure every time this server runs, it talks with the db and checks if the necessary data are available or not (broker table), if not then it should create the data automatically at the time of starting the application.