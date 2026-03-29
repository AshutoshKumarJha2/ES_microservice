# API Design

| Method	 | Endpoint	                                  | Description	                                            | Role                    |
|---------|--------------------------------------------|---------------------------------------------------------|-------------------------|
| POST	   | /api/v1/auth/signup	                       | User Registration	                                      | public                  |
| POST	   | /api/v1/auth/signin	                       | User Sign in	                                           | public                  |
| POST	   | /api/v1/refresh	                           | Refresh short access token	                             | public                  |
| GET	    | /api/v1/me	                                | Get current user details	                               | owner                   |
| PUT	    | /api/v1/users/{userId}	                    | Update user details	                                    | owner                   |
| GET	    | /api/v1/users	                             | Get all users	                                          | admin                   |
| GET	    | /api/v1/users/{userId}	                    | Get details of a user	                                  | owner/admin             |
| PATCH	  | /api/v1/users/{userId}/status	             | Update status of user	                                  | admin                   |
| PATCH	  | /api/v1/users/{userId}/role	               | Update the role of user	                                | admin                   |
| GET	    | /api/v1/users/{userId}/registrations	      | Lists all the event registrations user is attending	    | admin/owner             |
| GET	    | /api/v1/audit-logs	                        | Get all the audit logs	                                 | admin                   |
| ---	    | ---	                                       | ---	                                                    | ---                     |
| POST	   | /api/v1/events	                            | Create an event	                                        | organizer               |
| GET	    | /api/v1/events	                            | List events (by status, date, organizer, venue)	        | all                     |
| GET	    | /api/v1/events/{eventId}	                  | Get all details of a particular event	                  | all                     |
| PUT	    | /api/v1/events/{evnetId}	                  | Update details of event	                                | organizer/admin         |
| DELETE	 | /api/v1/events/{eventId}	                  | Delete a event	                                         | organizer/admin         |
| POST	   | /api/v1/events/{eventId}/schedules	        | Add a subtask/activity in event	                        | organizer               |
| GET	    | /api/v1/events/{eventId}/schedules	        | Get all the subtask/activity in event	                  | organizer/admin         |
| PUT	    | /api/v1/schedules/{scheduleId}	            | Update session time, title or location	                 | organizer               |
| DELETE	 | /api/v1/schedules/{scheduleId}	            | Delete a particular schedule	                           | organizer/admin         |
| ---	    | ---	                                       | ---	                                                    | ---                     |
| GET	    | /api/v1/venues	                            | Get all available venues	                               | organizer/admin         |
| POST	   | /api/v1/venues	                            | Create a venue	                                         | vm                      |
| PUT	    | /api/v1/venues/{velueId}	                  | Update venue details	                                   | vm                      |
| PATCH	  | /api/v1/venues/{venueId}/status	           | Update venue status	                                    | vm                      |
| DELETE	 | /api/v1/venues/{venueId}	                  | Delete a venue	                                         | vm/admin                |
| POST	   | /api/v1/venues/{venueId}/resources	        | Create a venue resource	                                | vm                      |
| PUT	    | /api/v1/resources/{resourceId}	            | Update resource details	                                | vm                      |
| POST	   | /api/v1/bookings	                          | Create a venue booking	                                 | organizer               |
| GET	    | /api/v1/venues/{venueId}/bookings	         | Get all bookings of a particular venue	                 | vm/admin                |
| PATCH	  | /api/v1/bookings/{bookingId}/status	       | Update status of booking id (accept, reject etc.)	      | vm/admin                |
| ---	    | ---	                                       | ---	                                                    | ---                     |
| POST	   | /api/v1/events/{eventId}/tickets	          | Define tickets for a event	                             | organizer               |
| GET	    | /api/v1/events/{eventId}/tickets	          | Get all available tickets	                              | all                     |
| PUT	    | /api/v1/tickets/{ticketId}	                | Update ticket details	                                  | organizer               |
| DELETE	 | /api/v1/tickets/{ticketId}	                | Delete a ticket type	                                   | organizer/admin         |
| POST	   | /api/v1/registrations	                     | Register for an event	                                  | attendee                |
| PATCH	  | /api/v1/registrations/{regId}	             | Accept or reject registration	                          | organizer               |
| ---	    | ---	                                       | ---	                                                    | ---                     |
| GET	    | /api/v1/vendors	                           | Get all vendors	                                        | all                     |
| POST	   | /api/v1/vendors	                           | Onboard a new vendor	                                   | vendor                  |
| GET	    | /api/v1/vendors/{vendorId}	                | Get all details of vendor	                              | all                     |
| PUT	    | /api/v1/vendors/{vendorId}	                | update details of a vendor	                             | vendor                  |
| DELETE	 | /api/v1/vendors/{vendorId}	                | Delete a vendor	                                        | vendor/admin            |
| POST	   | /api/v1/contracts	                         | Create a contract with new vendor	                      | organizer               |
| PATCH	  | /api/v1/contracts/{contractId}/status	     | Update status of a contract (active, terminated, etc.)	 | organizer/vendor        |
| POST	   | /api/v1/contracts/{contractId}/invoice	    | Generate a invoice for the contract, add payment also	  | finance/vendor          |
| GET	    | /api/v1/invoices	                          | Get all invoices	                                       | finance/vendor/admin    |
| GET	    | /api/v1/invoices/{invoiceId}	              | Get details of invoice	                                 | finance/vendor/admin    |
| POST	   | /api/v1/contrasts/{contractId}/deliveries	 | Add a deliverable to a contract	                        | vendor                  |
| PATCH	  | /api/v1/deliveries/{deliveryId}/status	    | Update status of a delivery	                            | vendor                  |
| PUT	    | /api/v1/deliveries/{deliveryId}	           | Update details of delivery	                             | vendor                  |
| DELETE	 | /api/v1/deliveries/{deliveryId}	           | Delete a particular delivery	                           | vendor/admin            |
| ---	    | ---	                                       | ---	                                                    | ---                     |
| POST	   | /api/v1/events/{eventId}/budget	           | Set budget of evnet	                                    | organizer               |
| GET	    | /api/v1/events/{eventId}/expenses	         | Get expenses for a event	                               | organizer/finance/admin |
| GET	    | /api/v1/expenses	                          | Get all expenses (supports filter)	                     | organizer/finance/admin |
| POST	   | /api/v1/events/{eventId}/expenses	         | Log an expense	                                         | organizer               |
| DELETE	 | /api/v1/expenses/{expenseId}	              | Deletes an expense	                                     | organizer/admin         |
| PATCH	  | /api/v1/expenses/{expenseId}/status	       | Approve/Reject an expense	                              | finance                 |
| POST	   | /api/v1/expenses/{expenseId}/payment	      | Marks payment as complete	                              | finance                 |
| ---	    | ---	                                       | ---	                                                    | ---                     |
| POST	   | /api/v1/engagements/log	                   | Logs an engagement	                                     | organizer/system        |
| GET	    | /api/v1/events/{eventId}/engagements	      | Get engagements of a particular event	                  | organizer/admin         |
| GET	    | /api/v1/engagements	                       | Get all engagements (filter)	                           | organizer/admin         |
| POST	   | /api/v1/feedback	                          | Submit a feedback	                                      | participants            |
| GET	    | /api/v1/feedback	                          | Get feedbacks (filter)	                                 | organizer/admin         |
| GET	    | /api/v1/events/{eventId}/feedback	         | Get aggrigated feedbacks 	                              | organizer/admin         |
| GET	    | /api/v1/notifications	                     | Get notifications of logged in user	                    | all                     |
| PATCH	  | /api/v1/notifications/{notiId}/status	     | Mark notifications as read	                             | all                     |
| POST	   | /api/v1/reports	                           | Report a problem	                                       | all                     |
| GET	    | /api/v1/reports	                           | Get aggrigated reports	                                 | admin                   |

