d3.queue()
  .defer(d3.json, 'https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/kickstarter-funding-data.json')
  .defer(d3.json, 'https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/movie-data.json')
  .defer(d3.json, 'https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/video-game-sales-data.json')
  .await((err, kickStart, movieSale, videoGame) => {

    if(err) return err;

    let data = {
      "kickStarter" : {
        "title" : "Kickstarter Pledges",
        "description" : "Top 100 Most Pledged Kickstarter Campaigns Grouped By Category",
        "data" : kickStart
      },
      "movieSales" : {
        "title" : "Movie Sales",
        "description" : "Top 100 Highest Grossing Movies Grouped By Genre",
        "data" : movieSale
      } ,
      "videoGames" : {
        "title" : "Video Game Sales",
        "description" : "Top 100 Most Sold Video Games Grouped by Platform",
        "data" : videoGame
      }
    };

    let legend = d3.select("#legend");
    let legendWidth = +legend.attr("width");
    const LEGEND_OFFSET = 10;
    const LEGEND_RECT_SIZE = 15;
    const LEGEND_H_SPACING = 150;
    const LEGEND_V_SPACING = 10;
    const LEGEND_TEXT_X_OFFSET = 3;
    const LEGEND_TEXT_Y_OFFSET = -2;
    let legendElemsPerRow = Math.floor(legendWidth/LEGEND_H_SPACING);

    let height = 670;
    let width = 1160;

    let color = d3.scaleOrdinal()
                  .range(d3.schemeCategory20c);
    
    let treemap = d3.treemap()
                    .size([width,height])
                    .padding(1);
                    
    let svg = d3.select('.mainSvg')
                .attr('width', width)
                .attr('height', height);
          
    let tooltip = d3.select('body')
                    .append('div')
                    .attr('id', 'tooltip')
                    .style('opacity', 0);

    let select =  d3.select('select');

    select.on('change', d => {
        createMap(data[d3.event.target.value])
    })
              
    createMap(data.kickStarter)                    

    function createMap(dataset){

      d3.select('#title')
        .text(dataset.title);

      d3.select('#description')
        .text(dataset.description);

      let root = d3.hierarchy(dataset.data, d => d.children)
                  .sum(d => d.value)
                  .sort((a, b) => b.height - a.height || b.value - a.value);
              
      treemap(root);
      
      let update = svg.selectAll("g")
                    .data(root.leaves(), d => d.data.name);
        
      update
        .exit()
        .remove();

      let node = update             
                  .enter()
                  .append('g')
                  .attr('transform', d =>  `translate(${d.x0},${d.y0})`)
                  .merge(update);

      node
        .append("rect")
        .classed('tile', true)
        .attr('data-name', d => d.data.name)
        .attr('data-category', d => d.data.category)
        .attr('data-value', d => d.data.value)
        .style("width", d => d.x1 - d.x0 + "px")
        .style("height", d => d.y1 - d.y0 + "px")
        .style("fill", d => color(d.data.category))
        .on('mouseover', d => {
          tooltip
            .transition()
            .style('opacity', 1);
          
          tooltip
            .attr('data-value', d.data.value)
            .html(`
              <p>Name : ${d.data.name}</p>
              <p>Categoty : ${d.data.category}</p>
              <p>Value : ${d.data.value}</p>
            `)
            .style('left', d3.event.pageX + 'px')
            .style('top', d3.event.pageY + 'px');

        })
        .on('mouseout', d => tooltip.transition().style('opacity', 0));

      node
        .append("text")
        .selectAll("tspan")
        .data(d => d.data.name.split(/(?=[A-Z][^A-Z])/g))
        .enter()
        .append("tspan")
        .attr("x", 4)
        .attr("y", (d, i) => 13 + i * 10)
        .text(d => d);
    
      let categories = root.leaves().map(nodes => nodes.data.category);
      categories = categories.filter((elem , i, arr) => arr.indexOf(elem) === i);
      
      legend.selectAll('*').remove();

      let legendElem = legend
                .append("g")
                .attr("transform", "translate(60," + LEGEND_OFFSET + ")")
                .selectAll("g")
                .data(categories)
                .enter().append("g")
                .attr("transform", function(d, i) { 
                  return 'translate(' + 
                  ((i%legendElemsPerRow)*LEGEND_H_SPACING) + ',' + 
                  ((Math.floor(i/legendElemsPerRow))*LEGEND_RECT_SIZE + (LEGEND_V_SPACING*(Math.floor(i/legendElemsPerRow)))) + ')';
                })
          
      legendElem.append("rect")                              
          .attr('width', LEGEND_RECT_SIZE)                          
          .attr('height', LEGEND_RECT_SIZE)     
          .attr('class','legend-item')                 
          .attr('fill', function(d){
            return color(d);
          })
          
      legendElem.append("text")                              
        .attr('x', LEGEND_RECT_SIZE + LEGEND_TEXT_X_OFFSET)    
        .attr('y', LEGEND_RECT_SIZE + LEGEND_TEXT_Y_OFFSET)                     
        .text(function(d) { return d; });  
    

    }       
  });