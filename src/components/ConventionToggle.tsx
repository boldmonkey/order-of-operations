import { getRuleColor, type OrderConvention, type OrderRule } from '../lib/bodmas';

type NotationOption = {
  value: OrderConvention;
  helper: string;
  segments: Array<{ text: string; rule: OrderRule }>;
};

const notationOptions: NotationOption[] = [
  {
    value: 'bodmas',
    helper: 'Brackets, Orders, Division/Multiplication',
    segments: [
      { text: 'B', rule: 'grouping' },
      { text: 'O', rule: 'exponents' },
      { text: 'D', rule: 'multiplicationDivision' },
      { text: 'M', rule: 'multiplicationDivision' },
      { text: 'A', rule: 'additionSubtraction' },
      { text: 'S', rule: 'additionSubtraction' }
    ]
  },
  {
    value: 'birdmas',
    helper: 'Brackets, Indices/Roots, Division/Multiplication',
    segments: [
      { text: 'B', rule: 'grouping' },
      { text: 'I', rule: 'exponents' },
      { text: 'R', rule: 'exponents' },
      { text: 'D', rule: 'multiplicationDivision' },
      { text: 'M', rule: 'multiplicationDivision' },
      { text: 'A', rule: 'additionSubtraction' },
      { text: 'S', rule: 'additionSubtraction' }
    ]
  },
  {
    value: 'pemdas',
    helper: 'Parentheses, Exponents, Multiplication/Division',
    segments: [
      { text: 'P', rule: 'grouping' },
      { text: 'E', rule: 'exponents' },
      { text: 'M', rule: 'multiplicationDivision' },
      { text: 'D', rule: 'multiplicationDivision' },
      { text: 'A', rule: 'additionSubtraction' },
      { text: 'S', rule: 'additionSubtraction' }
    ]
  }
];

interface Props {
  convention: OrderConvention;
  onChange: (value: OrderConvention) => void;
  label?: string;
  ariaLabel?: string;
}

const ConventionToggle = ({
  convention,
  onChange,
  label = 'Notation',
  ariaLabel = 'Choose notation mnemonic'
}: Props) => (
  <div className="convention-switcher">
    <span className="convention-switcher__label">{label}</span>
    <div className="convention-toggle" role="radiogroup" aria-label={ariaLabel}>
      {notationOptions.map((option) => (
        <label
          key={option.value}
          className={`convention-option ${
            convention === option.value ? 'convention-option--active' : ''
          }`}
          title={option.helper}
        >
          <input
            type="radio"
            name="notation"
            value={option.value}
            checked={convention === option.value}
            onChange={() => onChange(option.value)}
          />
          <span className="convention-option__label" aria-hidden="true">
            {option.segments.map((segment, idx) => (
              <span
                key={`${option.value}-${segment.text}-${idx}`}
                className="convention-option__segment"
                style={{ color: getRuleColor(segment.rule) }}
              >
                {segment.text}
              </span>
            ))}
          </span>
          <span className="sr-only">{option.helper}</span>
        </label>
      ))}
    </div>
  </div>
);

export default ConventionToggle;
