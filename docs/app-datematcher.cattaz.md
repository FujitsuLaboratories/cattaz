# Date matcher application

Date matcher helps an organizer to coodinate meeting time.

1. First, an organizer creates meeting time candidates.

   ```datematcher
   ```

1. Then, attendees can register their answers.

   ```datematcher
   candidates:
     - 06 Mar
     - 07 Mar
     - 08 Mar
   attendees:
     Alice:
       06 Mar: OK
       07 Mar: OK
       08 Mar: Not OK
     Bob:
       06 Mar: OK
       07 Mar: Not OK
       08 Mar: OK
   ```
