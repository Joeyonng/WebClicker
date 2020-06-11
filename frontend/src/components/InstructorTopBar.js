import React from 'react';
import {connect} from 'react-redux';
import {withRouter} from "react-router-dom";
import randomMC from 'random-material-color';

import {withStyles} from '@material-ui/core/styles';
import withWidth from "@material-ui/core/withWidth";
import Typography from '@material-ui/core/Typography';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';
import ButtonGroup from "@material-ui/core/ButtonGroup";
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import AddIcon from '@material-ui/icons/Add';

import {
    activatePoll,
    activateSession,
    createPoll,
    createSession,
    deactivatePoll,
    deactivateSession, displayPoll,
    fetchPolls,
    fetchSessions,
    listenCourseActivity,
} from "../firebaseApi";
import {changeCourses, changePolls, changeSessions} from "../redux";
import ListItem from "@material-ui/core/ListItem";
import {ListItemText, TextField} from "@material-ui/core";
import Paper from "@material-ui/core/Paper";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import CardActions from "@material-ui/core/CardActions";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";

const styles = theme => ({
    appBarSpacer: theme.mixins.toolbar,
    topBar: {
        top: 0,
        zIndex: 2,
    },
    bottomBar: {
        top: 'auto',
        bottom: 0,
    },
    pollActions: {
        padding: 0,
        width: 550
    }
});

class InstructorTopBar extends React.Component {
    constructor(props) {
        super(props);
        //console.log("InstructorTopBar props", this.props);

        this.state = {
            statisticsOpen: false,
            courseDashboardOpen: false,
            courseSettingsOpen: false,
        };
    }

    componentDidMount() {
        //console.log('InstructorTopBar: componentDidMount', this.props);

        if(this.props.match.params.courseID !== undefined && this.props.match.params.courseID !== '') {
            let data = {
                courseID: this.props.match.params.courseID,
                action: course => {
                    let newCourses = Object.assign({}, this.props.courses);
                    newCourses[this.props.match.params.courseID] = Object.assign(newCourses[this.props.match.params.courseID], course);
                    this.props.changeCourses(newCourses);

                    if (this.props.courses[this.props.match.params.courseID].courseActivitySessionID !== '') {
                        this.props.history.push('/instructor/' + this.props.match.params.courseID + '/' +
                            this.props.courses[this.props.match.params.courseID].courseActivitySessionID);
                    }
                },
            };
            this.unListenCourseActivity = listenCourseActivity(data);
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        //console.log('InstructorTopBar: componentDidUpdate', prevProps, this.props);

        if(this.props.match.params.courseID !== prevProps.match.params.courseID) {
            if(this.props.match.params.courseID !== undefined && this.props.match.params.courseID !== '') {
                let data = {
                    courseID: this.props.match.params.courseID,
                    action: course => {
                        let newCourses = Object.assign({}, this.props.courses);
                        newCourses[this.props.match.params.courseID] = Object.assign(newCourses[this.props.match.params.courseID], course);
                        this.props.changeCourses(newCourses);

                        if (this.props.courses[this.props.match.params.courseID].courseActivitySessionID !== '') {
                            this.props.history.push('/instructor/' + this.props.match.params.courseID + '/' +
                                this.props.courses[this.props.match.params.courseID].courseActivitySessionID);
                        }
                    },
                };
                this.unListenCourseActivity = listenCourseActivity(data);
            }
        }
    }

    componentWillUnmount() {
        //console.log('InstructorTopBar: componentWillUnmount');

        this.unListenCourseActivity();
    }

    render() {
        let mobile = this.props.width === 'sm' || this.props.width === 'xs';

        let secondAppBar = this.props.courses[this.props.match.params.courseID] === undefined ? null : (
            <ListItem
                className={this.props.classes.pollActions}
                dense={true}
            >
                <ListItemText
                    primary={this.props.polls[this.props.courses[this.props.match.params.courseID].courseActivityPollID] === undefined ? 'No Poll is Active'
                        : 'Poll ' + this.props.polls[this.props.courses[this.props.match.params.courseID].courseActivityPollID].pollIndex
                        + (this.props.courses[this.props.match.params.courseID].courseActivityPollLive ? ' is running' : ' is stopped')}
                    secondary={"Session " + (this.props.sessions[this.props.courses[this.props.match.params.courseID].courseActivitySessionID] === undefined ? ''
                        : this.props.sessions[this.props.courses[this.props.match.params.courseID].courseActivitySessionID].sessionIndex)}
                />
                <CardActions>
                    <Button
                        size="small"
                        onClick={() => {
                            if(!this.props.courses[this.props.match.params.courseID].courseActivityPollLive) {
                                let data = {
                                    pollStartTime: Date.now(),
                                    pollSessionID: this.props.courses[this.props.match.params.courseID].courseActivitySessionID,
                                    pollVotedColor: randomMC.getColor(),
                                    pollCategories: this.props.courses[this.props.match.params.courseID].courseCategories,
                                };

                                createPoll(data).then(pollID => {
                                    let data = {
                                        pollID: pollID,
                                    };

                                    activatePoll(data).then(() => {
                                        let data = {
                                            sessionID: this.props.courses[this.props.match.params.courseID].courseActivitySessionID,
                                        };

                                        fetchPolls(data).then(polls => {
                                            this.props.changePolls(polls);
                                        });
                                    });
                                });
                            }
                            else {
                                let data = {
                                    courseID: this.props.match.params.courseID,
                                };

                                deactivatePoll(data);
                            }
                        }}
                    >
                        {!this.props.courses[this.props.match.params.courseID].courseActivityPollLive ? 'New Poll' : 'Stop Poll'}
                    </Button>

                    <Button
                        size="small"
                        onClick={() => {
                            let data = {
                                courseID: this.props.match.params.courseID,
                                displayPoll: !this.props.courses[this.props.match.params.courseID].courseActivityPollDisplay,
                            };
                            displayPoll(data);
                        }}
                    >
                        {this.props.courses[this.props.match.params.courseID].courseActivityPollDisplay ? 'Hide Results' : 'Push Results'}
                    </Button>
                </CardActions>
            </ListItem>
        );

        return (
            <div>
                <AppBar
                    className={this.props.classes.topBar}
                    color="inherit"
                    position="fixed"
                    elevation={0}
                >
                    <Toolbar>
                        <Grid
                            container
                            direction="row"
                            justify="space-between"
                            alignItems="center"
                        >
                            <Grid item>
                                <Grid container direction="row" alignItems="center">
                                    <Grid item>
                                        <IconButton
                                            color="inherit"
                                            onClick={() => {
                                                this.props.userMenuOpenCtl(!this.props.userMenuOpen);
                                            }}
                                        >
                                            <MenuIcon/>
                                        </IconButton>
                                    </Grid>

                                    <Grid item>
                                        <Typography
                                            display="inline"
                                            variant='h6'
                                        >
                                            {this.props.courses[this.props.match.params.courseID] === undefined ? 'WebClicker'
                                                : this.props.courses[this.props.match.params.courseID].courseName}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Grid>

                            <Grid item>
                                {mobile ? null : secondAppBar}
                            </Grid>

                            <Grid item>
                                {this.props.courses[this.props.match.params.courseID] === undefined ? null :
                                    <ButtonGroup
                                        variant="outlined"
                                        size="small"
                                    >
                                        <Button
                                            size="small"
                                            onClick={() => {
                                                if (this.props.courses[this.props.match.params.courseID].courseActivitySessionID === '') {
                                                    let data = {
                                                        sessionStartTime: Date.now(),
                                                        sessionCourseID: this.props.match.params.courseID,
                                                    };

                                                    createSession(data).then(sessionID => {
                                                        let data = {
                                                            sessionID: sessionID,
                                                        };

                                                        activateSession(data).then(() => {
                                                            let data = {
                                                                courseID: this.props.match.params.courseID,
                                                            };

                                                            fetchSessions(data).then(sessions => {
                                                                this.props.changeSessions(sessions);
                                                                this.props.history.push('/instructor/' + this.props.match.params.courseID + '/' +
                                                                    this.props.courses[this.props.match.params.courseID].courseActivitySessionID);
                                                            });
                                                        });
                                                    });
                                                }
                                                else {
                                                    let data = {
                                                        courseID: this.props.match.params.courseID,
                                                    };

                                                    deactivateSession(data).catch(err => {
                                                        console.log(err);
                                                    });
                                                }
                                            }}
                                        >
                                            {this.props.courses[this.props.match.params.courseID].courseActivitySessionID === '' ? <AddIcon /> : "Stop Session"}
                                        </Button>

                                        <Button
                                            onClick={() => {
                                                this.props.sessionMenuOpenCtl(!this.props.sessionMenuOpen)
                                            }}
                                        >
                                            {(this.props.sessions[this.props.match.params.sessionID] === undefined ? 'Sessions'
                                                : ' Session ' + this.props.sessions[this.props.match.params.sessionID].sessionIndex)}
                                        </Button>
                                    </ButtonGroup>
                                }
                            </Grid>
                        </Grid>

                    </Toolbar>

                    {!mobile ? null :
                        <Toolbar>
                            {secondAppBar}
                        </Toolbar>
                    }

                    <Divider/>
                </AppBar>

                {!mobile ? null : <div className={this.props.classes.appBarSpacer}/>}
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
        changeSessions: (data) => dispatch(changeSessions(data)),
        changePolls: (data) => dispatch(changePolls(data)),
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withRouter(withStyles(styles, {withTheme: true})(withWidth()(InstructorTopBar))));
