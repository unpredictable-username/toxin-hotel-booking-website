import { createStore, Action } from '../../store/store';

const sliders = Array(
  ...((document.getElementsByClassName(
    'js-range-slider',
  ) as unknown) as Array<HTMLElement>),
);

const initState = sliders.reduce((state, slider) => {
  const left = slider.querySelector(
    '.js-range-slider__element-left',
  ) as HTMLInputElement;
  const right = slider.querySelector(
    '.js-range-slider__element-right',
  ) as HTMLInputElement;

  return {
    ...state,
    [slider.id]: {
      left: left.getAttribute('value'),
      right: right.getAttribute('value'),
      min: left.getAttribute('min'),
      max: left.getAttribute('max'),
    },
  };
}, {});

enum actions {
  CHANGE_LEFT_THUMB,
  CHANGE_RIGHT_THUMB,
  SET_MIN_VALUE,
  SET_MAX_VALUE,
}

const reducer = (action: Action, state: any) => {
  switch (action.name) {
    case actions.CHANGE_LEFT_THUMB:
      return {
        ...state,
        [action.value.id]: {
          ...state[action.value.id],
          left: action.value.cost,
        },
      };
    case actions.CHANGE_RIGHT_THUMB:
      return {
        ...state,
        [action.value.id]: {
          ...state[action.value.id],
          right: action.value.cost,
        },
      };
    case actions.SET_MIN_VALUE:
      return {
        ...state,
        [action.value.id]: { ...state[action.value.id], min: action.value.min },
      };
    case actions.SET_MAX_VALUE:
      return {
        ...state,
        [action.value.id]: { ...state[action.value.id], max: action.value.max },
      };
    default:
      return state;
  }
};

const store = createStore(initState, reducer);

sliders.forEach(slider => {
  store.subscribe(state => {
    const display = document.getElementById(
      `display-for-${slider.id}`,
    ) as HTMLElement;

    const { min, max, left, right } = state[slider.id];

    display.innerHTML = `
      ${Math.floor(left / 1000) || ''}
      ${String(left).slice(-3)}&#8381; -
      ${Math.floor(right / 1000) || ''}
      ${String(right).slice(-3)}&#8381;
    `;

    const leftThumb = slider.querySelector(
      '.js-slider__thumb_left',
    ) as HTMLElement;
    const rightThumb = slider.querySelector(
      '.js-slider__thumb_right',
    ) as HTMLElement;
    const range = slider.querySelector('.js-slider__range') as HTMLElement;

    const leftPercent = ((left - min) / (max - min)) * 100;
    const rightPercent = ((right - min) / (max - min)) * 100;

    leftThumb.style.left = `${leftPercent - 0.05 * leftPercent - 1}%`;
    rightThumb.style.left = `${rightPercent - 0.05 * rightPercent}%`;
    range.style.left = `${leftPercent}%`;
    range.style.right = `${100 - rightPercent}%`;
  });

  const inputElementLeft = slider.querySelector(
    '.js-range-slider__element-left',
  ) as HTMLInputElement;
  const inputElementRight = slider.querySelector(
    '.js-range-slider__element-right',
  ) as HTMLInputElement;

  store.dispatch({ name: 'COLD_START' });
  store.dispatch({
    name: actions.SET_MIN_VALUE,
    value: { id: slider.id, min: parseInt(inputElementLeft.min) },
  });
  store.dispatch({
    name: actions.SET_MAX_VALUE,
    value: { id: slider.id, max: parseInt(inputElementLeft.max) },
  });

  const { left, right } = store.getState()[slider.id];

  inputElementLeft.value = left;
  inputElementLeft.addEventListener('input', (event: any) => {
    const value = Math.min(
      parseInt(event.target.value),
      store.getState()[slider.id].right,
    );

    event.target.value = String(value);

    store.dispatch({
      name: actions.CHANGE_LEFT_THUMB,
      value: {
        id: event.target.parentElement.id,
        cost: value,
      },
    });
  });

  inputElementRight.value = right;
  inputElementRight.addEventListener('input', (event: any) => {
    const value = Math.max(
      parseInt(event.target.value),
      store.getState()[slider.id].left,
    );

    event.target.value = String(value);

    store.dispatch({
      name: actions.CHANGE_RIGHT_THUMB,
      value: {
        id: event.target.parentElement.id,
        cost: value,
      },
    });
  });
});
