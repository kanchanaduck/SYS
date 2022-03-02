# How to start project HRGIS for developer
### Start with Dotnet core Back-end
##### For develop 
* cd BN
* dotnet restore
* dotnet ef update database --context ApplicationDbContext
* Run sql script BN\wwwroot\Database on database server
* dotnet watch run
* Open swagger
* http://cptsvs531:5000/api-hrgis/api/OracleHRMS/Holiday/Dump
* Pull Organization from OracleHRMS /api/OracleHRMS/Organization/Dump
* Pull Employee from OracleHRMS /api/OracleHRMS/Employee/Dump
* Pull Holiday from OracleHRMS /api/OracleHRMS/Holiday/Dump
* Mock band api/Bands/Mock
* Mock menu api/Menus/Mock
##### For test
* Mock band api/Trainers/Mock
* Mock menu api/Centers/Mock
* Mock menu api/CourseMasters/Mock
### Start with Angular Front-end
* cd FN
* npm install
* ng serve
