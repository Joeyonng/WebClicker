import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from "react-router-dom";

import moment from 'moment';

import {withStyles} from '@material-ui/core/styles';
import withWidth from "@material-ui/core/withWidth/withWidth";
import Drawer from '@material-ui/core/Drawer'
import List from '@material-ui/core/List';
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import Avatar from "@material-ui/core/Avatar";
import IconButton from "@material-ui/core/IconButton";
import DoneIcon from '@material-ui/icons/Done';
import MoreVertOutlinedIcon from "@material-ui/icons/MoreVertOutlined";

import {changeSessions} from "../redux";
import {fetchSessions} from "../firebaseApi";

const styles = theme => ({
    appBarSpacer: theme.mixins.toolbar,
    iconButton: {
        padding: 8,
    },
    drawer: props => ({
        width: 260,
        zIndex: 1,
    })
});

class InstructorSessions extends Component {
    constructor(props) {
        super(props);
        //console.log("InstructorSessions Constructor", this.props);

        this.state = {
            statisticsOpen: false,
            deleteConfirmOpen: false,
            selected: [],
        };
    }

    componentDidMount() {
        //console.log('InstructorSessions: componentDidMount', this.props);

        let data = {
            courseID: this.props.match.params.courseID,
        };

        fetchSessions(data).then(data => {
            this.props.changeSessions(data);
        });
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        //console.log('InstructorSessions: componentDidUpdate', prevProps, this.props);

        if(this.props.match.params.courseID !== prevProps.match.params.courseID) {
            let data = {
                courseID: this.props.match.params.courseID,
            };

            fetchSessions(data).then(data => {
                this.props.changeSessions(data);
            });
        }
    }

    render() {
        let mobile = this.props.width === 'sm' || this.props.width === 'xs';

        return (
            <div>
                <Drawer
                    classes={{paper: mobile ? null : this.props.classes.drawer}}
                    anchor="right"
                    variant={mobile ? "temporary" : "persistent"}
                    open={this.props.open}
                    onClose={() => {
                        this.props.openCtl(false);
                        this.setState({selected: []});
                    }}
                >
                    {mobile ? null : <div className={this.props.classes.appBarSpacer}/>}

                    <List>
                        {Object.values(this.props.sessions).reverse().map(session => {
                            return (
                                <ListItem
                                    key={session.sessionID}
                                    button
                                    selected={this.props.match.params.sessionID === String(session.sessionID)}
                                    onClick={()=>{
                                        this.props.history.push('/instructor/' + this.props.match.params.courseID + '/' + session.sessionID);

                                        if(mobile) {
                                            this.props.openCtl(false);
                                        }
                                    }}
                                >
                                    <ListItemAvatar>
                                        <IconButton
                                            style={{padding: 0}}
                                            disabled={!this.props.open}
                                            onClick={(event) => {
                                                if(this.props.open) {
                                                    let newSelected = this.state.selected;
                                                    if(newSelected.indexOf(session.sessionID) === -1) {
                                                        newSelected.push(session.sessionID);
                                                    }
                                                    else {
                                                        newSelected.splice(newSelected.indexOf(session.sessionID), 1);
                                                    }
                                                    this.setState(newSelected);
                                                    event.stopPropagation();
                                                }
                                            }}
                                        >
                                            <Avatar>
                                                {this.state.selected.indexOf(session.sessionID) === -1 ? session.sessionIndex : <DoneIcon/>}
                                            </Avatar>
                                        </IconButton>
                                    </ListItemAvatar>

                                    <ListItemText
                                        primary={"Session " + session.sessionIndex}
                                        secondary={moment(session.sessionStartTime).format("ddd, MM/DD/YYYY")}
                                    />

                                    <ListItemSecondaryAction>
                                        <IconButton>
                                            <MoreVertOutlinedIcon/>
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            )
                        })}
                    </List>
                </Drawer>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return state;
};

const mapDispatchToProps = (dispatch) => {
    return {
        changeSessions: (data) => dispatch(changeSessions(data)),
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withRouter(withStyles(styles, {withTheme: true})(withWidth()(InstructorSessions))));
