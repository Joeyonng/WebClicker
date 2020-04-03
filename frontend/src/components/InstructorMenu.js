import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from "react-router-dom";

import {withStyles} from '@material-ui/core/styles';
import withWidth from "@material-ui/core/withWidth";
import Drawer from '@material-ui/core/Drawer'
import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import IconButton from "@material-ui/core/IconButton";
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import MoreVertOutlinedIcon from '@material-ui/icons/MoreVertOutlined';

import {changeAccount, changeCourses} from "../redux";
import {fetchCourses, signOut} from "../firebaseApi";
import CourseSettings from "./CourseSettings";

const styles = theme => ({
    appBarSpacer: theme.mixins.toolbar,
    headerListItem: {
        height: 64,
        [theme.breakpoints.down('xs')]: {
            height: 56,
        },
    },
    drawer: {
        width: 260,
        zIndex: 1,
    },
});

class InstructorMenu extends Component {
    constructor(props) {
        super(props);
        //console.log("InstructorMenu Constructor", this.props);

        this.state = {
            snifferPageOpen: false,
            courseSettingsOpen: false,
        };
    }

    componentDidMount() {
        //console.log('InstructorMenu: componentDidMount', this.props);

        if (this.props.account.accountID !== undefined && this.props.account.accountID !== '') {
            let data = {
                accountID: this.props.account.accountID,
            };

            fetchCourses(data).then(courses => {
                this.props.changeCourses(courses)
            });
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        //console.log('InstructorMenu: componentDidUpdate', prevProps, this.props);

        if (this.props.account.accountID !== prevProps.account.accountID) {
            if (this.props.account.accountID !== undefined && this.props.account.accountID !== '') {
                let data = {
                    accountID: this.props.account.accountID,
                };

                fetchCourses(data).then(courses => {
                    this.props.changeCourses(courses)
                });
            }
        }
    }

    componentWillUnmount() {
        //console.log('InstructorMenu: componentWillUnmount');
    }

    render() {
        let mobile = this.props.width === 'sm' || this.props.width === 'xs';

        return (
            <div>
                <Drawer
                    classes={{paper: this.props.classes.drawer}}
                    anchor="left"
                    variant={mobile ? "temporary" : "persistent"}
                    open={this.props.open}
                    onClose={() => {
                        this.props.openCtl(false);
                    }}
                >
                    {mobile ? null : <div className={this.props.classes.appBarSpacer}/>}

                    <ListItem className={this.props.classes.headerListItem}>
                        <ListItemText
                            primary={this.props.account.accountName}
                            secondary={this.props.account.accountEmail}
                        />
                        <IconButton
                            onClick={() => {
                                signOut().then(() => {
                                    this.props.changeAccount({});
                                    this.props.history.push('/login')
                                })
                            }}
                        >
                            <ExitToAppIcon/>
                        </IconButton>
                    </ListItem>

                    <Divider/>

                    <List
                        subheader={<ListSubheader>Courses</ListSubheader>}
                    >
                        {Object.values(this.props.courses).map(course =>
                            <ListItem
                                key={course.courseName}
                                button
                                selected={this.props.match.params.courseID === course.courseID}
                                onClick={() => {
                                    this.props.history.push('/instructor/' + course.courseID);
                                    if(mobile) {
                                        this.props.openCtl(false);
                                    }
                                }}
                            >
                                <ListItemText primary={course.courseName} />
                                <ListItemSecondaryAction>
                                    <IconButton>
                                        <MoreVertOutlinedIcon/>
                                    </IconButton>
                                </ListItemSecondaryAction>
                            </ListItem>
                        )}

                        <ListItem
                            button
                            onClick={() => {
                                this.setState({courseSettingsOpen: true})
                            }}
                        >
                            <ListItemText primary={'Add Course'} />
                        </ListItem>
                    </List>

                    <Divider/>
                </Drawer>

                <CourseSettings
                    key={"Settings New"  + this.state.courseSettingsOpen}
                    open={this.state.courseSettingsOpen}
                    openCtl={(open) => {this.setState({courseSettingsOpen: open})}}
                    newCourse={true}
                />
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return state;
};

const mapDispatchToProps = (dispatch) => {
    return {
        changeAccount: (data) => dispatch(changeAccount(data)),
        changeCourses: (data) => dispatch(changeCourses(data)),
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withRouter(withStyles(styles, { withTheme: true })(withWidth()(InstructorMenu))));
