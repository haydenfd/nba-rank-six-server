# Rank 6 Backend Service

-   Hosted on AWS EC2 (t2.micro Ubuntu) w/ PM2.


## Evaluating attempt 

- Get solution map
- Compute scores
    - if scores results in win -> update session, send back solution, session_status, attempts, update user stats
    - same thing is loss.
    - else, don't do much; just send back session_status, attempts