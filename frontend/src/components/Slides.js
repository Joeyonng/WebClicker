import React from 'react';
import {connect} from 'react-redux';
import {withRouter} from "react-router-dom";

import {withStyles} from '@material-ui/core/styles';
import withWidth from "@material-ui/core/withWidth";
import Container from "@material-ui/core/Container";
//import firebase from 'firebase/app'
import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import 'firebase/storage'
import {changePolls} from "../redux";
import {fetchPoll} from "../firebaseApi";
import {initFirebase} from "../firebaseApi";
import Typography from "@material-ui/core/Typography";
import './slideshow.css';

	const styles = theme => ({
    appBarSpacer: theme.mixins.toolbar,
    mainPage: props => ({
        zIndex: 0,
        marginLeft: props.userMenuOpen ? 260 : 0,
        transition: theme.transitions.create(['margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    }),
});



const imgUrls = [[]];
//const imgUrlsTemp = [];
const folderList = [];


function copyImage(){
    var img=document.getElementById("currentImage");
	if (window.getSelection().empty) { 
		window.getSelection().empty();
	} else if (window.getSelection().removeAllRanges) {  
		window.getSelection().removeAllRanges();
	}
    var r = document.createRange();
    r.setStartBefore(img);
    r.setEndAfter(img);
    r.selectNode(img);
    window.getSelection().addRange(r);
    document.execCommand('Copy');
	window.getSelection().removeRange(r);
	displayCopiedWindow();
}

function displayCopiedWindow() {
   if (document.getElementById("imageCopied") != null) {
    document.getElementById('imageCopied').style.display = 'block';
	setTimeout(function() {
      document.getElementById('imageCopied').style.display = 'none';
    }, 1000);
  }
}


function clearArray(){
		try {
			for(var i=0; i<imgUrls.length; i++){
				imgUrls.pop();
			}
			
		}
		catch(err) {
		}
		
}

function getFilesList(courseId){ 
		var storage = firebase.app().storage("gs://iclicker-web-c0d76.appspot.com");
		var storageRef = storage.ref();
		var listRef = storageRef.child("/uploadtest/"+courseId+"/");
		
		
		listRef.listAll().then(function(res) {
		  res.prefixes.forEach(function(folderRef) {
			
			
			folderRef.listAll().then(function(res2) {
				var tempArray=[];
			  res2.items.forEach(function(itemRef) {
				  //console.log(i+" "+itemRef);
				  itemRef.getDownloadURL().then(function(url) {tempArray.push(url.toString());}).catch(function(error) {});
			  });
			  imgUrls.push(tempArray);
			}).catch(function(error) {});
		  });
		}).catch(function(error2) {
		});
}

class Slides extends React.Component {
   constructor (props) {
		super(props);
		
		this.state = {
			currentImageIndex: 0,
			currentFolder:1,
			isActive:false
		};
		//clearArray();
		//getFilesList(this.props.match.params.courseID);
		
		//getFoldersList(this.props.match.params.courseID);
		this.handleShowSlides = this.handleShowSlides.bind(this);
		this.handleHideSlides = this.handleHideSlides.bind(this);
		this.nextSlide = this.nextSlide.bind(this);
		this.previousSlide = this.previousSlide.bind(this);
		this.nextLecture = this.nextLecture.bind(this);
		this.previousLecture = this.previousLecture.bind(this);
	}
	
	
	
	
handleShowSlides = () => {
		try {
			getFilesList(this.props.match.params.courseID);		
			this.setState({
			  isActive: true,
			  currentImageIndex: 0,
			  currentFolder:1
			});
		}
		catch(err) {
		  
		}
		
	  };

  handleHideSlides = () => {
		try {
			clearArray();
			this.setState({
			  isActive: false,
			  currentImageIndex: 0,
			  currentFolder:1
			});
		}
		catch(err) {
		  
		}
	  };
	
	
	
	previousSlide () {
		
		//console.log(imgUrls.length);
		//orderList();
		try {
			  var folderNum=0;
			try{
				for(var i=1; i<imgUrls.length; i++){
					if(imgUrls[i][0].includes("Lecture"+this.state.currentFolder+"%")){
						folderNum=i;		
					}
				}
			}
			catch(err){}
			
			const lastIndex = imgUrls[folderNum].length - 1;
			const { currentImageIndex } = this.state;
			const shouldResetIndex = currentImageIndex === 0;
			const index =  shouldResetIndex ? lastIndex : currentImageIndex - 1;
			
			this.setState({
				currentImageIndex: index
			});
		}
		catch(err) {
		  
		}
		
		
	}
	
	nextSlide () {
		
		try {
			  var folderNum=0;
			try{
				for(var i=1; i<imgUrls.length; i++){
					if(imgUrls[i][0].includes("Lecture"+this.state.currentFolder+"%")){
						folderNum=i;		
					}
				}
			}
			catch(err){}
			
			const lastIndex = imgUrls[folderNum].length - 1;
			const { currentImageIndex } = this.state;
			const shouldResetIndex = currentImageIndex === lastIndex;
			const index =  shouldResetIndex ? 0 : currentImageIndex + 1;

			this.setState({
				currentImageIndex: index
			});
		}
		catch(err) {
		  
		}
		
		
	}
	
	previousLecture () {
		
		const lastIndex = imgUrls.length - 1;
		const { currentFolder } = this.state;
		const shouldResetIndex = currentFolder === 0;
		var index =  shouldResetIndex ? lastIndex : currentFolder - 1;
		if(index == 0){
			index=lastIndex;
		}
		
		this.setState({
			currentImageIndex: 0
		});
		this.setState({
			currentFolder: index
		});
		
	}
	
	nextLecture () {
		
		
		const lastIndex = imgUrls.length - 1;
		const { currentFolder } = this.state;
		const shouldResetIndex = currentFolder === lastIndex;
		var index =  shouldResetIndex ? 0 : currentFolder + 1;
		if(index == 0){
			index=1;
		}

		this.setState({
			currentImageIndex: 0
		});
		this.setState({
			currentFolder: index
		});
		
	}
	
	copyImageToClipboard(){
		copyImage();
	}
	
	
	getCurrentImage(currentFolder, currentScreenshot){
		currentScreenshot+=1;
		//console.log(imgUrls.length+"  "+imgUrls[this.state.currentFolder]);
		try {
			  var folderNum=0;
			try{
				for(var i=1; i<imgUrls.length; i++){
					if(imgUrls[i][0].includes("Lecture"+currentFolder+"%")){
						folderNum=i;		
					}
				}
				document.getElementById("lectureNum").innerHTML = "Lecture "+currentFolder+" of "+(imgUrls.length-1) ;
				document.getElementById("slideNum").innerHTML = "Slide "+currentScreenshot+" of "+imgUrls[folderNum].length ;
			}
			catch(err){}
			
			var h=0;
			for(var i=0; i<imgUrls[folderNum].length; i++){
				if(imgUrls[folderNum][i].includes("screenshot"+currentScreenshot+".jpg")){
					h=i;		
				}
			}
			return imgUrls[folderNum][h];	
		}
		catch(err) {
			return null;	
		}
		
	}	
    componentDidMount() {
	
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
      
    }
	

    render() {	
        let mobile = this.props.width === 'sm' || this.props.width === 'xs';
		if (this.state.isActive) {
				return (
					<div className={mobile ? null : this.props.classes.mainPage}>
					
						<div className={this.props.classes.appBarSpacer}/>	
						
						<div class="twoButton">
							<button onClick={this.handleHideSlides}>Hide Slides</button>
							<button onClick={this.copyImageToClipboard}>Copy To Clipboard</button>
						</div>
						
						
							
							
							<div className="slideshow-container">
							
								<div className="slideNum" id="lectureNum">Lecture 1</div>
								<Arrow direction="left" clickFunction={ this.previousLecture } glyph="&#10094;" />
								<Arrow direction="right" clickFunction={ this.nextLecture } glyph="&#10095;" />
							
							</div>	
							
							<div className="slideshow-container">
								<div className="slideNum" id="slideNum">Slide 1</div>
								<Arrow direction="left" clickFunction={ this.previousSlide } glyph="&#10094;" />
								<div class="imageCopied" id="imageCopied">Image copied</div>
								<img src={this.getCurrentImage(this.state.currentFolder, this.state.currentImageIndex)} onClick={this.copyImageToClipboard} id="currentImage" style={{width: '100%', verticalAlign: 'middle'}}/>
								<Arrow direction="right" clickFunction={ this.nextSlide } glyph="&#10095;" />
							
							</div>
														
					</div>
				);
		}
		else {
				return (
					<div className={mobile ? null : this.props.classes.mainPage}>
					
						<div className={this.props.classes.appBarSpacer}/>	
						<button onClick={this.handleShowSlides} className="show_button">Show Slides</button>
					</div>
				);
		}
    }
}

const mapStateToProps = (state) => {
    return state;
};

const mapDispatchToProps = (dispatch) => {
    return {
        changePolls: (data) => dispatch(changePolls(data)),
    };
};

const Arrow = ({ direction, clickFunction, glyph }) => (
	<div 
		className={ 'slide-arrow '+direction } 
		onClick={ clickFunction }>
		{ glyph } 
	</div>
);

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withRouter(withStyles(styles, {withTheme: true})(withWidth()(Slides))));
