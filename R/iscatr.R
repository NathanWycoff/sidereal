#' <Add Title>
#'
#' <Add Description>
#'
#' @import htmlwidgets
#'
#' @export
iscatr <- function(data, col =NULL, size = NULL, name = NULL, width = NULL, height = NULL, 
                    elementId = NULL) {

    if (class(data) != "data.frame") {
        stop("The points attribute of the user defined function's plot_data needs to be a data.frame")
    }

    # Ensure a default color
    if (is.null(col)) {
        col <- 'red'
    }
    if (is.null(size)) {
        size <- 5
    }
    if (is.null(name)) {
        name <- paste('Point', as.character(1:nrow(data))) 
    }

    # Store our attributes in a data frame.
    colnames(data) <- c('x', 'y')
    data$title <- 
    data$col <- col 
    data$radius <- size
    data$name <- name

    # An R ID identifying the row of each datum in the original R dataframe.
    data$rid <- 1:nrow(data)

    #data$desc <- sapply(data$title, function(i) paste(rep(i, 10)))

    p_data <- jsonlite::toJSON(data)


  # forward options using x
  x = list(
    data = p_data
  )

  # create widget
  htmlwidgets::createWidget(
    name = 'iscatr',
    x,
    width = width,
    height = height,
    package = 'sidereal',
    elementId = elementId
  )
}

#' Shiny bindings for iscatr
#'
#' Output and render functions for using iscatr within Shiny
#' applications and interactive Rmd documents.
#'
#' @param outputId output variable to read from
#' @param width,height Must be a valid CSS unit (like \code{'100\%'},
#'   \code{'400px'}, \code{'auto'}) or a number, which will be coerced to a
#'   string and have \code{'px'} appended.
#' @param expr An expression that generates a iscatr
#' @param env The environment in which to evaluate \code{expr}.
#' @param quoted Is \code{expr} a quoted expression (with \code{quote()})? This
#'   is useful if you want to save an expression in a variable.
#'
#' @name iscatr-shiny
#'
#' @export
iscatrOutput <- function(outputId, width = '100%', height = '800px'){
  htmlwidgets::shinyWidgetOutput(outputId, 'iscatr', width, height, package = 'sidereal')
}

#' @rdname iscatr-shiny
#' @export
renderIscatr <- function(expr, env = parent.frame(), quoted = FALSE) {
  if (!quoted) { expr <- substitute(expr) } # force quoted
  htmlwidgets::shinyRenderWidget(expr, iscatrOutput, env, quoted = TRUE)
}
