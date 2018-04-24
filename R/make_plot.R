#!/usr/bin/Rscript
#  R/make_plot.R Author "Nathan Wycoff <nathanbrwycoff@gmail.com>" Date 04.24.2018

## Make the default plot for now using iPLSV



#' A default test function
#'
#' @param user_func A function which will be called several times. TODO: fill in the details once they're known.
#' @return Nothing, used for side effects.
#' @export 
#Test out the num_max function.
int_scatter <- function(user_func) {
    library(shiny)
    require(jsonlite)

    runApp(list(ui = fluidPage(
                               actionButton("do", "Update Viz"),

                               # example use of the automatically generated output function
                               iscatrOutput("scatr1")
                               ),
                server = function(input, output, session) {
                    get_viz <- eventReactive(input$do, {
                                                 uf <- user_func(input$cool_id, session$userData)
                                                 session$userData <- uf$userData

                                                 if (is.null(uf$plot_data$points)) {
                                                     stop("User defined function needs to at least return a 'points' attribute; see examples")
                                                 }
                                                 return(uf$plot_data)
                               })

                    # example use of the automatically generated render function
                    output$scatr1 <- renderIscatr({ 
                        plot_data <- get_viz()
                        iscatr(plot_data$points, col = plot_data$col, size = plot_data$size)
                    })
                }))
}
