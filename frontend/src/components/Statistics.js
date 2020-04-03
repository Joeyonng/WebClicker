import React from 'react';
import {connect} from 'react-redux';
import {withRouter} from "react-router-dom";

import MaterialTable from "material-table";

import {withStyles} from "@material-ui/core";
import withWidth from "@material-ui/core/withWidth/withWidth";
import Button from "@material-ui/core/Button";
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import LinearProgress from "@material-ui/core/LinearProgress";
import ClearIcon from '@material-ui/icons/Clear'
import SearchIcon from '@material-ui/icons/Search'
import NavigateNextIcon from '@material-ui/icons/NavigateNext'
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore'

import Paper from "@material-ui/core/Paper";

const styles = theme => ({
});

class Statistics extends React.Component {
    constructor(props) {
        super(props);
        //console.log("Statistics props", this.props);

        this.state = {
            polls: {},
        };

        /*
        Promise.all(
            this.props.selectedSessions.map(session => getSessionPolls(this.props.account.email, session))
        ).then(sessionsPolls => {
            let newPolls = sessionsPolls.reduce((acc, cur) => Object.assign(acc, cur), {});
            this.setState({polls: newPolls});
        })
         */
    }

    analyzePolls() {
        let results = [];
        if(Object.keys(this.state.polls).length !== 0) {
            let students = {};
            for(let pollId in this.state.polls) {
                for(let studentId in this.state.polls[pollId].result) {
                    let poll = this.state.polls[pollId];
                    let correct = poll.answer === undefined ? true : poll.answer === poll.result[studentId];
                    if(students[studentId] === undefined) {
                        students[studentId] = [correct];
                    }
                    else {
                        students[studentId].push(correct);
                    }
                }
            }

            let count = 0;
            let totalSum = 0;
            let participationSum = 0;
            let performanceSum = 0;
            for(let studentId in students) {
                let total = Object.keys(this.state.polls).length;
                let participation = students[studentId].length;
                let performance = students[studentId].filter(correct => correct).length;

                results.push({
                    'student': studentId,
                    'total_point': total,
                    'participation_point': participation,
                    'participation_rate': (participation / total).toFixed(2),
                    'performance_point': performance,
                    'performance_rate': (performance / participation).toFixed(2),
                });

                count++;
                totalSum += total;
                participationSum += participation;
                performanceSum += performance;
            }

            results.splice(0, 0, {
                'student': 'Average',
                'total_point': (totalSum / count).toFixed(2),
                'participation_point': (participationSum / count).toFixed(2),
                'participation_rate': (participationSum / totalSum).toFixed(2),
                'performance_point': (performanceSum / count).toFixed(2),
                'performance_rate': (performanceSum / participationSum).toFixed(2),
            });
        }

        return results;
    }

    render() {
        let mobile = this.props.width === 'sm' || this.props.width === 'xs';

        return (
            <Dialog
                disableBackdropClick
                disableEscapeKeyDown
                fullScreen={mobile}
                fullWidth
                maxWidth="xl"
                open={this.props.open}
                onClose={() => {this.props.openCtl(false)}}
            >
                {Object.keys(this.state.polls).length === 0 ? <LinearProgress/> : null}

                <DialogTitle>
                    {this.props.course.name + ' Students Statistics'}
                </DialogTitle>

                {Object.keys(this.props.polls).length === 0 ? null :
                    <DialogContent>
                        <MaterialTable
                            title={'Statistics for ' + Object.keys(this.state.polls).length + ' Poll(s)'}
                            columns={[
                                {title: 'Student', field: 'student'},
                                {title: 'Total Point', field: 'total_point'},
                                {title: 'Participation Point', field: 'participation_point'},
                                {title: 'Participation Rate', field: 'participation_rate'},
                                {title: 'Performance Point', field: 'performance_point'},
                                {title: 'Performance Rate', field: 'performance_rate'},
                            ]}
                            components={{Container: (props) => <Paper {...props} elevation={0}/>}}
                            options={{
                                showFirstLastPageButtons: false,
                                pageSize: 5,
                                pageSizeOptions: [],
                            }}
                            data={this.analyzePolls()}
                            icons={{
                                Search: SearchIcon, NextPage: NavigateNextIcon, PreviousPage: NavigateBeforeIcon, ResetSearch: ClearIcon
                            }}
                        />
                    </DialogContent>
                }

                <DialogActions>
                    <Button
                        onClick={() => {this.props.openCtl(false)}}
                    >
                        OK
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}

const mapStateToProps = (state) => {
    return state;
};

const mapDispatchToProps = (dispatch) => {
    return {};
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withRouter(withStyles(styles, {withTheme: true})(withWidth()(Statistics))));

