// UI Components (default exports, re-exported as named)
import ButtonComponent from './ui/Button';
import InputComponent from './ui/Input';
import CardComponent from './ui/Card';
import ToastComponent, { ToastContainer as ToastContainerComponent } from './ui/Toast';

export const Button = ButtonComponent;
export const Input = InputComponent;
export const Card = CardComponent;
export const Toast = ToastComponent;
export const ToastContainer = ToastContainerComponent;

// Common Components (default exports, re-exported as named)
import TimerComponent from './common/Timer';
import ScoreDisplayComponent from './common/ScoreDisplay';
import StrikeIndicatorComponent from './common/StrikeIndicator';
import LoadingSpinnerComponent from './common/LoadingSpinner';
import ModalComponent from './common/Modal';

export const Timer = TimerComponent;
export const ScoreDisplay = ScoreDisplayComponent;
export const StrikeIndicator = StrikeIndicatorComponent;
export const LoadingSpinner = LoadingSpinnerComponent;
export const Modal = ModalComponent;

// Game Components (default exports, re-exported as named)
import AnswerBoardComponent from './game/AnswerBoard';
import QuestionDisplayComponent from './game/QuestionDisplay';
import TeamScorePanelComponent from './game/TeamScorePanel';

export const AnswerBoard = AnswerBoardComponent;
export const QuestionDisplay = QuestionDisplayComponent;
export const TeamScorePanel = TeamScorePanelComponent;

// Host Components (default exports, re-exported as named)
import HostControlPanelComponent from './host/HostControlPanel';

export const HostControlPanel = HostControlPanelComponent;