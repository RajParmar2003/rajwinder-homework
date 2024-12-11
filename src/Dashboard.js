import React, { Component } from "react";
import * as d3 from "d3";
import FileUpload from "./FileUpload";

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.svgRef = React.createRef();
    this.state = {
      colorMode: "Sentiment",
      selectedTweets: [],
      tweets: null, // Set to null initially to hide dropdown and visualization
    };
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevState.tweets !== this.state.tweets ||
      prevState.colorMode !== this.state.colorMode
    ) {
      this.createVisualization();
    }
  }

  createVisualization() {
    if (!this.state.tweets) return;

    const { colorMode, tweets } = this.state;
    const width = 1200;
    const height = 800;
    const margin = { top: 100, right: 50, bottom: 50, left: 120 };

    const monthRegions = {
      March: height / 5,
      April: height / 2,
      May: (4 * height) / 5,
    };

    const slicedTweets = tweets.slice(0, 300);

    const svg = d3
      .select(this.svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    svg.selectAll(".dynamic-elements").remove();
    const dynamicGroup = svg.append("g").attr("class", "dynamic-elements");

    const sentimentColorScale = d3
      .scaleLinear()
      .domain([-1, 0, 1])
      .range(["red", "#ECECEC", "green"]);

    const subjectivityColorScale = d3
      .scaleLinear()
      .domain([0, 1])
      .range(["#ECECEC", "#4467C4"]);

    const colorScale =
      colorMode === "Sentiment" ? sentimentColorScale : subjectivityColorScale;

    const simulation = d3
      .forceSimulation(slicedTweets)
      .force("x", d3.forceX(width / 2).strength(0.19))
      .force("y", d3.forceY((d) => monthRegions[d.Month]).strength(1.5))
      .force("charge", d3.forceManyBody().strength(-15))
      .force("collision", d3.forceCollide(10))
      .stop();

    for (let i = 0; i < 300; i++) simulation.tick();

    dynamicGroup
      .selectAll("circle")
      .data(slicedTweets)
      .enter()
      .append("circle")
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .attr("r", 6)
      .attr("fill", (d) => colorScale(d[colorMode]))
      .attr("stroke", "black")
      .attr("stroke-width", 0.5)
      .on("click", (event, d) => this.handleTweetClick(d));

    svg.selectAll(".month-label").remove();
    svg
      .selectAll(".month-label")
      .data(Object.keys(monthRegions))
      .enter()
      .append("text")
      .attr("class", "month-label")
      .attr("x", margin.left - 70)
      .attr("y", (month) => monthRegions[month])
      .attr("dy", "0.35em")
      .style("text-anchor", "end")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .text((month) => month);

    this.updateLegend(svg, width, colorMode);
  }

  updateLegend(svg, width, colorMode) {
    svg.selectAll(".legend").remove();
    const legend = svg
      .append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${width - 150}, 50)`);

    const sentimentColorScale = d3
      .scaleLinear()
      .domain([-1, 0, 1])
      .range(["red", "#ECECEC", "green"]);

    const subjectivityColorScale = d3
      .scaleLinear()
      .domain([0, 1])
      .range(["#ECECEC", "#4467C4"]);

    const colorScale =
      colorMode === "Sentiment" ? sentimentColorScale : subjectivityColorScale;

    svg.selectAll("defs").remove();
    const gradient = svg
      .append("defs")
      .append("linearGradient")
      .attr("id", "gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");

    gradient
      .append("stop")
      .attr("offset", "0%")
      .attr(
        "stop-color",
        colorMode === "Sentiment"
          ? sentimentColorScale(1)
          : subjectivityColorScale(1)
      );

    gradient
      .append("stop")
      .attr("offset", "100%")
      .attr(
        "stop-color",
        colorMode === "Sentiment"
          ? sentimentColorScale(-1)
          : subjectivityColorScale(0)
      );

    legend
      .append("rect")
      .attr("width", 20)
      .attr("height", 100)
      .style("fill", "url(#gradient)");

    legend
      .append("text")
      .attr("x", 25)
      .attr("y", 10)
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .text(colorMode === "Sentiment" ? "Positive" : "Subjective");

    legend
      .append("text")
      .attr("x", 25)
      .attr("y", 90)
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .text(colorMode === "Sentiment" ? "Negative" : "Objective");
  }

  handleDropdownChange = (event) => {
    this.setState({ colorMode: event.target.value });
  };

  handleTweetClick = (tweet) => {
    this.setState((prevState) => {
      const isSelected = prevState.selectedTweets.find(
        (t) => t.idx === tweet.idx
      );
      d3.select(this.svgRef.current)
        .selectAll("circle")
        .filter((d) => d.idx === tweet.idx)
        .attr("stroke", isSelected ? "black" : "black")
        .attr("stroke-width", isSelected ? 0.5 : 3);
      if (isSelected) {
        return {
          selectedTweets: prevState.selectedTweets.filter(
            (t) => t.idx !== tweet.idx
          ),
        };
      }
      return { selectedTweets: [tweet, ...prevState.selectedTweets] };
    });
  };

  handleFileUpload = (data) => {
    this.setState({ tweets: data });
  };

  render() {
    const { tweets, selectedTweets } = this.state;

    return (
      <div>
        <div style={{ marginBottom: "20px" }}>
          <FileUpload onFileUpload={this.handleFileUpload} />
          {tweets && (
            <label style={{ marginLeft: "10px" }}>
              Color By:
              <select
                onChange={this.handleDropdownChange}
                style={{
                  marginLeft: "5px",
                  padding: "5px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              >
                <option value="Sentiment">Sentiment</option>
                <option value="Subjectivity">Subjectivity</option>
              </select>
            </label>
          )}
        </div>
        {tweets && <svg ref={this.svgRef}></svg>}
        {tweets && (
          <div>
            <h2>Selected Tweets</h2>
            <ul>
              {selectedTweets.map((tweet) => (
                <li key={tweet.idx}>{tweet.RawTweet}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }
}

export default Dashboard;
