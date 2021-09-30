import {Redirect, Route, Switch} from 'react-router-dom';
import {Fragment} from 'react';
import TestsListPage from './pages/TestsPage';
import TestDetailPage from './pages/TestDetailPage';
import ReportsPage from './pages/ReportsPage';
import ReportDetailPage from './pages/ReportDetailPage';

function App() {
    return (
        <Fragment>
            <Switch>
                <Route path="/" exact>
                    <Redirect to="/tests"/>
                </Route>
                <Route path="/tests" exact>
                    <TestsListPage/>
                </Route>
                <Route path="/reports" exact>
                    <ReportsPage/>
                </Route>
                <Route path="/reports/:name" exact>
                    <ReportDetailPage/>
                </Route>
                <Route path="/tests/:testId" exact>
                    <TestDetailPage/>
                </Route>
            </Switch>
        </Fragment>
    );
}

export default App;
