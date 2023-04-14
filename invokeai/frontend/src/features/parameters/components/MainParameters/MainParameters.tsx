import MainCFGScale from './MainCFGScale';
import MainHeight from './MainHeight';
import MainIterations from './MainIterations';
import MainSampler from './MainSampler';
import MainSteps from './MainSteps';
import MainWidth from './MainWidth';

export const inputWidth = 'auto';

export default function MainSettings() {
  return (
    <div className="main-settings">
      <div className="main-settings-list">
        <div className="main-settings-row">
          <MainWidth />
          <MainHeight />
          <MainCFGScale />
        </div>
        <div className="main-settings-row">
          <MainSampler />
          <MainSteps />
        </div>
      </div>
    </div>
  );
}
