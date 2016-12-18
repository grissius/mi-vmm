#!/usr/bin/env Rscript
data = read.csv("time.csv", sep=",")
plotT <- function(){
	png('time.png', height=500, width=1000)

	plot(
		data$n, data$dominant,
		main="Time performance", xlab="n", ylab="time [ms]",
     	# ylim=c(0, 0.0035),
		#log="y",
     	col="red", pch=3
	)
	axis(1, at=data$n, labels=data$n)
	
	points(data$n, data$fetch, col="blue", pch=3)
	points(data$n, data$rerank, col="green", pch=3)
	legend('topleft', 'left', c('Color extraction response', 'Flickr API reponse', 'Compute distance and sort'), pch = 3, col=c('red', 'blue', 'green'))
	dev.off()
}
plotT();