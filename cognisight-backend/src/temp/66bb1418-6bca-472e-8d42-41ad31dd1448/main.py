num = int(input("Enter a number: "))  
  
if num < 0:  
   print("Negative numbers are not allowed")  
else:  
   sum = 0
   i = num
   # finding the sum  
   while(i > 0):  
       sum += i  
       i -= 1  
   print(sum)