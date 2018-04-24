#!/usr/bin/Rscript
#  R/make_plot.R Author "Nathan Wycoff <nathanbrwycoff@gmail.com>" Date 04.24.2018

## Make the default plot for now using iPLSV

library(sidereal)
library(shiny)
require(jsonlite)
require(iplsv)


#Test out the num_max function.
set.seed(1234)

K <- 3
V <- 4
M <- 20
N.mu <- 300
P <- 2
eta <- 2
gamma <- 0.1 * K
beta <- 0.1 * M

ret <- gen_plsv(K, V, M, N.mu, P, eta, gamma, beta)

runApp(list(ui = fluidPage(
                           actionButton("do", "Update Viz"),

                           # example use of the automatically generated output function
                           iscatrOutput("scatr1")
                           ),
            server = function(input, output, session) {
                get_viz <- eventReactive(input$do, {
                                             if (!is.null(session$userData$fit)) {
                                                 THETA_res <- fromJSON(input$cool_id)

                                                 iter <- 0
                                                 THETA_fix <- list()
                                                 for (ti in THETA_res$title) {
                                                     iter <- iter + 1
                                                     ind <- as.numeric(gsub('a', '', ti))
                                                     THETA_fix[[iter]] <- list(ind = ind, val = as.numeric(THETA_res[iter,1:2]))
                                                 }
                                                 print(THETA_fix)

                                                 #TODO: Not a global var.
                                                 session$userData$fit <- num_post_plsv(ret$docs, K, V, P, eta, gamma, beta,
                                                                                       THETA_fix = THETA_fix,
                                                                                       THETA_init = session$userData$fit$par$THETA,
                                                                                       PSI_init = session$userData$fit$par$PSI,
                                                                                       PHI_init = session$userData$fit$par$PHI)
                                             } else {
                                                 session$userData$fit <- num_post_plsv(ret$docs, K, V, P, eta, gamma, beta)
                                             }

                                             to_plot <- as.data.frame(rbind(session$userData$fit$par$THETA, session$userData$fit$par$PSI))

                                             return(to_plot)
                           })

                # example use of the automatically generated render function
                output$scatr1 <- renderIscatr({ 
                    data <- get_viz()
                    iscatr(data, col = sample(c('red', 'green'), nrow(data), replace = TRUE))
                })
            }))
