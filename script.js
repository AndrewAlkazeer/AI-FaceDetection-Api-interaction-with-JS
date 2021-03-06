const imageUpload = document.getElementById('imageUpload');

Promise.all([
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  //  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  //  faceapi.nets.faceExpressionNet.loadFromUri('/models')
    faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
]).then(start);

async function start(){
    const container = document.createElement('div');
    container.style.position = 'relative';
    document.body.append(container);
    const labeledFaceDescriptors = await loadLabeledImages();
        //console.log(labeledFaceDescriptors);
        const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);
      //  console.log(faceMatcher);
        
    document.body.append('Loaded');
    imageUpload.addEventListener('change', async () =>{
        const image = await faceapi.bufferToImage(imageUpload.files[0]);
        //document.body.append(image);
        container.append(image);
        const canvas = faceapi.createCanvasFromMedia(image);
        container.append(canvas);
        const displaySize = { width: image.width, height: image.height};
        faceapi.matchDimensions(canvas, displaySize);
        const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors();
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor));
        results.forEach((result, i) => {
            const box = resizedDetections[i].detection.box;
            const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString()})
            drawBox.draw(canvas);
        })
       // document.body.append(detections.length);
        console.log(detections.descriptor);
        
    })
}
/*
video.addEventListener('playing', ()=>{
    //const canvas = faceapi.createCanvasFromMedia(video);
    //document.body.append(canvas);

    setInterval(async () => {
        const detections = await faceapi.detectAllFaces(video, 
            new faceapi.TinyFaceDetectorOptions());
            console.log(detections);
    }, 2000);
})
*/

function loadLabeledImages(){
    const labels = ['Andrew Alkazeer', 'Brad Pitt', 'Kirsten Dunst', 'Nancy Ajram'];
    return Promise.all(
        labels.map(async label => {
            const descriptions = [];
            for(let i = 1; i <= 2; i++){
                const img = await faceapi.fetchImage(`./labeled_images/${label}/${i}.jpg`);
                const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
                descriptions.push(detections.descriptor);
            }
            return new faceapi.LabeledFaceDescriptors(label, descriptions);
        })
    )
}