#!/usr/bin/Rscript
#  R/make_plot.R Author "Nathan Wycoff <nathanbrwycoff@gmail.com>" Date 04.24.2018

## Make the default plot for now using iPLSV

#TODO: put this function somewhere more appropriate.
#'Solve the orthogonal procrustes problem
#'
#' Finds a unitary matrix W such that ||A - WB|| is minimized: the orthogonal procrustes problem. Note that if A and B are, say, n by 2 matrices, and we want to rotate the rows to make the points in 2D space as close as possible, we want to postmultiply, not premultiply, B by a unitary matrix The user is therefore advised to do B %*% t(orth_proc(t(A), t(B))) in this case.
#'
#' @param A A Matrix of the same dimension as B
#' @param B A Matrix of the same dimension of A of which a rotation will be computed which puts it closest to A.
#' @param comp_stress Should we compute and return the F norm of A - WB, where W is the rotation?
#' @return If comp_stress, a list with elements W, the rotation matrix, and stress, the scalar norm of the  difference, or just the matrix W if not.
orth_proc <- function(A, B, comp_stress = TRUE) {
    ret <- svd(A %*% t(B))
    W <- ret$u %*% t(ret$v)

    if (comp_stress) {
        stress <- norm(A - W %*% B)
        return(list(W = W, stress = stress))
    } else {
        return(W)
    }
}


#' A default test function
#'
#' @param user_func A function which will be called several times. TODO: fill in the details once they're known.
#' @param rot A boolean, if true, will rotate/reflect data after an update to best fit the previous data by solving the orthogonal procrustes problem.
#' @return Nothing, used for side effects.
#' @export 
#Test out the num_max function.
int_scatter <- function(user_func, rot = FALSE, longtext = TRUE) {
    library(shiny)
    require(jsonlite)

    ui_list <- list()
    ui_list[[length(ui_list)+1]] <- titlePanel("Sidereal")
    ui_list[[length(ui_list)+1]] <- actionButton("do", "Update Display")
    ui_list[[length(ui_list)+1]] <- actionButton("traces", "Show Traces")

    # We create a sidebar for documents, and don't if the data don't represent documents.
    if (longtext) {
        ui_list[[length(ui_list)+1]] <- radioButtons("mode", label = "Mode:", 
                                                     choices = list("Interaction" = "int", "Reading" = "read"))
        ui_list[[length(ui_list)+1]] <- sidebarLayout(
                                                      sidebarPanel(textOutput("text_disp"))
                                                      ,
                                                      mainPanel(
                                                                iscatrOutput("scatr1")
                                                                )
                                                      )


    } else {
        ui_list[[length(ui_list)+1]]<- iscatrOutput("scatr1")
    }

    runApp(list(ui = fluidPage(ui_list),
                server = function(input, output, session) {
                    get_viz <- eventReactive(input$do, {

                                                 cat("Moved points in server func:\n")
                                                 print(input$moved_points)

                                                 uf <- user_func(input$moved_points, session$userData$pdata)
                                                 session$userData$pdata <- uf$pdata

                                                 if (is.null(uf$plot_data$points)) {
                                                     stop("User defined function needs to at least return a 'points' attribute; see examples")
                                                 }

                                                 # Rotate the data
                                                 if (rot && !is.null(session$userData$last_points)) {
                                                     A <- t(as.matrix(session$userData$last_points))
                                                     B <- t(as.matrix(uf$plot_data$points))
                                                     W <- orth_proc(A, B)$W
                                                     uf$plot_data$points <- as.data.frame(as.matrix(uf$plot_data$points) %*% t(W))
                                                 }

                                                 # Need to clone environment; not enough to assign to new var
                                                 ud_copy <- as.environment(as.list(session$userData, all.names = TRUE))
                                                 ret <- list(plot_data = uf$plot_data, 
                                                             userData = ud_copy)


                                                 session$userData$last_points <- uf$plot_data$points


                                                 return(ret)
                               })

                    observeEvent(input$mode,{

                                     # send the message to the event handler with name handler1 if we press the action button
                                     session$sendCustomMessage("changeMode", input$mode)
                               })

                    observeEvent(input$traces, {
                                     if (input$traces %% 2 == 1) {
                                         updateActionButton(session, "traces",
                                                            label = "Hide Traces")

                                         # send the message to the event handler with name handler1 if we press the action button
                                         session$sendCustomMessage("showTraces",input$traces)
                                     } else {
                                         updateActionButton(session, "traces",
                                                            label = "Show Traces")

                                         # send the message to the event handler with name handler1 if we press the action button
                                         session$sendCustomMessage("hideTraces",input$traces)
                                     }
                               })

                    # example use of the automatically generated render function
                    output$scatr1 <- renderIscatr({ 
                        res <- get_viz()
                        plot_data <- res$plot_data
                        last_points <- res$userData$last_points
                        iscatr(plot_data$points, last_points = last_points, 
                               col = plot_data$col, size = plot_data$size, name = plot_data$name,
                               longtext = plot_data$longtext)
                        #do.call(iscatr, plot_data)
                    })
                    output$text_disp <- renderText({ 
                        req(input$text_contents)
                        input$text_contents
                    })
                }))
}
