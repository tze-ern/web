let port, reader, writer;

let maxData = 50;
let counter = 0;
let dataStack = Array(maxData).fill({});
let divStack = Array(maxData).fill({});

async function setup() {
	document.getElementById("monitor").style.display = "none";
	document.getElementById("map").style.display = "none"
	createCanvas(windowWidth, windowHeight);
	noLoop();
	({ port, reader, writer } = await getPort(115200));
    console.log("CONNECTED");
	document.getElementById("defaultCanvas0").style.display = "none";
	document.getElementById("monitor").style.display = "block";
	document.getElementById("map").style.display = "block"
	loop();
}

async function draw() {
    
	try {
		while (true) {
			const { value, done } = await reader.read();

			if (done) {
				// Allow the serial port to be closed later.
				reader.releeasLock();
				break;
			}
			if (value) {
				// console.log(value);
				
                if (value[0] == "Ü"){
                    removedStr = value.substr(1 , value.length);
                    // console.log(removedStr)
                    parsedData = JSON.parse(removedStr);
					
					let {
						name, gender, ICnumber, 
						WhatHappened, Description,
						x, y,
						...otherData
					} = parsedData;
					
					console.log(`Name: ${name}\nGender: ${gender}\nIC Number: ${ICnumber}\nIncident: ${WhatHappened}\nDescription: ${Description}`)

					let d = makeNewDiv(
						`Name: ${name}`, `Gender: ${gender}`, `IC Number: ${ICnumber}`,
						`What Happened: ${WhatHappened}`, `Description: ${Description}`,`___________________________`
					);

					if (Object.keys(dataStack[counter]).length != 0) {
						// current counter has stuff in it; remove div from DOM
						divStack[counter].remove();
					}
					
					document.getElementById("monitor").appendChild(d);
					dataStack[counter] = parsedData;
					divStack[counter] = d;
					counter = (counter+1)%maxData;
					initMap(5, 100, "name", "gender", "ICnumber", "WhatHappened", "Description")
                }
			}
		}
	} catch (e) { console.error(e) }
}


function makeNewDiv() {
	let d = document.createElement("div");
	for (let i=0; i<arguments.length; i++) {
		let n = document.createElement("div");
		n.innerHTML = arguments[i];
		d.appendChild(n);
	}
	return d;
}

function initMap(x,y,name, gender, ICnumber, WhatHappened, Description,) {
	const locations = [
		{ lat: x, lng: y },
	  
	  ];	
    const map = new google.maps.Map(document.getElementById("map"), {
      zoom: 3,
      center: { lat: -28.024, lng: 140.887 },
    });
    const infoWindow = new google.maps.InfoWindow({
      content: "",
      disableAutoPan: true,
    });
    // Create an array of alphabetical characters used to label the markers.
    const labels = name;
    let data = `Name: ${name}\nGender: ${gender}\nIC Number: ${ICnumber}\nIncident: ${WhatHappened}\nDescription: ${Description}`
    // Add some markers to the map.
    const markers = locations.map((position, i) => {
      const label = labels[i % labels.length];
      const marker = new google.maps.Marker({
        position,
        label,
      });
  
      // markers can only be keyboard focusable when they have click listeners
      // open info window when marker is clicked
      marker.addListener("click", () => {
        infoWindow.setContent(data);
        infoWindow.open(map, marker);
      });
      return marker;
    });
  
    // Add a marker clusterer to manage the markers.
  
    const markerCluster = new markerClusterer.MarkerClusterer({ map, markers });
  }
  
  
  window.initMap = initMap;
  
  
