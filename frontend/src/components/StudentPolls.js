import React from 'react';
import {connect} from 'react-redux';
import {withRouter} from "react-router-dom";

import {withStyles} from '@material-ui/core/styles';
import withWidth from "@material-ui/core/withWidth";
import Container from "@material-ui/core/Container";

import StudentPoll from "./StudentPoll";
import {changePolls} from "../redux";
import {fetchPoll} from "../firebaseApi";
import Typography from "@material-ui/core/Typography";

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

class StudentPolls extends React.Component {
    constructor(props) {
        super(props);
        //console.log("InstructorPolls Constructor", this.props);

        this.state = {
            poll: null,
        };
    }

    componentDidMount() {
        //console.log('InstructorPolls: componentDidMount', this.props);

        if(this.props.match.params.pollID !== undefined && this.props.match.params.pollID !== '') {
            let data = {
                pollID: this.props.match.params.pollID
            };
            fetchPoll(data).then(poll => {
                this.setState({poll: poll})
            });
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        //console.log('InstructorPolls: componentDidUpdate', prevProps, this.props);

        if (this.props.match.params.pollID !== prevProps.match.params.pollID) {
            if(this.props.match.params.pollID !== undefined && this.props.match.params.pollID !== '') {
                let data = {
                    pollID: this.props.match.params.pollID
                };
                fetchPoll(data).then(poll => {
                    this.setState({poll: poll})
                });
            }
        }
    }

    componentWillUnmount() {
        //console.log('InstructorPolls: componentWillUnmount');
    }

    render() {
        let mobile = this.props.width === 'sm' || this.props.width === 'xs';

        return (
            <div className={mobile ? null : this.props.classes.mainPage}>
                <div className={this.props.classes.appBarSpacer}/>

                {this.state.poll === null ? <Typography>No Active Poll</Typography> :
                    (mobile ?
                            <StudentPoll
                                poll={this.state.poll}
                                course={this.props.courses[this.props.match.params.courseID]}
                            />
                            :
                            <Container maxWidth="md">
                                <StudentPoll
                                    poll={this.state.poll}
                                    course={this.props.courses[this.props.match.params.courseID]}
                                />
                            </Container>
                    )
                }
            </div>
        );
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

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withRouter(withStyles(styles, {withTheme: true})(withWidth()(StudentPolls))));
