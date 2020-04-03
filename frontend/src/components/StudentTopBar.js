import React from 'react';
import {connect} from 'react-redux';
import {withRouter} from "react-router-dom";

import {withStyles} from '@material-ui/core/styles';
import withWidth from "@material-ui/core/withWidth";
import AppBar from '@material-ui/core/AppBar';
import Typography from '@material-ui/core/Typography';
import Toolbar from '@material-ui/core/Toolbar';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from "@material-ui/icons/Menu";

import {listenCourseActivity} from "../firebaseApi";
import {changeCourses, changePolls} from "../redux";

const styles = theme => ({
    appBarSpacer: theme.mixins.toolbar,
    appBarTitle: {
        flexGrow: 1,
    },
});

class InstructorTopBar extends React.Component {
    constructor(props) {
        super(props);
        //console.log("StudentTopBar props", this.props);

        this.state = {
        };
    }

    componentDidMount() {
        //console.log('StudentTopBar: componentDidMount', this.props);

        if(this.props.match.params.courseID !== undefined && this.props.match.params.courseID !== '') {
            let data = {
                courseID: this.props.match.params.courseID,
                action: course => {
                    let newCourses = Object.assign({}, this.props.courses);
                    newCourses[this.props.match.params.courseID] = Object.assign(newCourses[this.props.match.params.courseID], course);
                    this.props.changeCourses(newCourses);

                    if (this.props.match.params.pollID !== course.courseActivityPollID) {
                        this.props.history.push('/student/' + course.courseID + '/' + course.courseActivityPollID);
                    }
                },
            };

            listenCourseActivity(data);
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        //console.log('StudentTopBar: componentDidUpdate', prevProps, this.props);

        if(this.props.match.params.courseID !== prevProps.match.params.courseID) {
            if(this.props.match.params.courseID !== undefined && this.props.match.params.courseID !== '') {
                let data = {
                    courseID: this.props.match.params.courseID,
                    action: course => {
                        let newCourses = Object.assign({}, this.props.courses);
                        newCourses[this.props.match.params.courseID] = Object.assign(newCourses[this.props.match.params.courseID], course);
                        this.props.changeCourses(newCourses);

                        if (this.props.match.params.pollID !== course.courseActivityPollID) {
                            this.props.history.push('/student/' + course.courseID + '/' + course.courseActivityPollID);
                        }
                    },
                };

                listenCourseActivity(data);
            }
        }
    }

    componentWillUnmount() {
        //console.log('StudentTopBar: componentWillUnmount');
    }

    render() {
        return (
            <div>
                <AppBar
                    color="inherit"
                    position="fixed"
                    elevation={0}
                >
                    <Toolbar>
                        <IconButton
                            color="inherit"
                            onClick={() => {
                                this.props.userMenuOpenCtl(!this.props.userMenuOpen);
                            }}
                        >
                            <MenuIcon/>
                        </IconButton>

                        <Typography
                            className={this.props.classes.appBarTitle}
                            variant='h6'
                        >
                            {this.props.courses[this.props.match.params.courseID] === undefined ? 'WebClicker'
                                : this.props.courses[this.props.match.params.courseID].courseName}
                        </Typography>
                    </Toolbar>

                    <Divider/>
                </AppBar>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return state;
};

const mapDispatchToProps = (dispatch) => {
    return {
        changeCourses: (data) => dispatch(changeCourses(data)),
        changePolls: (data) => dispatch(changePolls(data)),
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withRouter(withStyles(styles, {withTheme: true})(withWidth()(InstructorTopBar))));
