// Ilustraciones vectoriales de componentes. No representan una fotografía del modelo.
export default function HardwareArt({ category = "", hero = false }) {
  const kind = category.toLowerCase();
  return (
    <svg
      viewBox="0 0 400 300"
      fill="none"
      aria-hidden="true"
      className={hero ? "hero-art" : undefined}
    >
      <ellipse
        cx="204"
        cy="248"
        rx="130"
        ry="17"
        fill="#1e2a20"
        opacity=".07"
      />
      {hero || kind.includes("gráfic") ? (
        <g transform="translate(23 38) rotate(-8 175 100)">
          <path d="M23 60 294 40 345 67 75 92Z" fill="#718375" />
          <path d="m75 92 270-25v113L75 205Z" fill="#25362d" />
          <path d="m23 60 52 32v113l-52-32Z" fill="#405b48" />
          <rect x="92" y="106" width="228" height="74" rx="8" fill="#354a3a" />
          {[147, 264].map((x) => (
            <g key={x}>
              <circle
                cx={x}
                cy="143"
                r="35"
                fill="#1d2a21"
                stroke="#7b917c"
                strokeWidth="2"
              />
              {[0, 60, 120, 180, 240, 300].map((a) => (
                <path
                  key={a}
                  d={`M${x} 141q-26-29-25 5 11-17 25 0`}
                  fill="#7c9180"
                  transform={`rotate(${a} ${x} 143)`}
                />
              ))}
              <circle cx={x} cy="143" r="8" fill="#d8e3c7" />
            </g>
          ))}
          <path d="m110 201 116-11v11l-116 11Z" fill="#d9bf78" />
          <text
            x="151"
            y="72"
            fill="#d6e2c5"
            fontSize="10"
            fontFamily="monospace"
            transform="rotate(-4 151 72)"
          >
            PIXEL / FORGE
          </text>
        </g>
      ) : kind.includes("proces") ? (
        <g transform="translate(104 54) rotate(12 90 90)">
          <rect width="192" height="192" rx="8" fill="#314e3d" />
          {Array.from({ length: 12 }, (_, i) => (
            <g key={i}>
              <path
                d={`M${15 + i * 14} -8v8m0 192v8M-8 ${15 + i * 14}h8m192 0h8`}
                stroke="#bba76a"
                strokeWidth="5"
              />
            </g>
          ))}
          <rect x="25" y="25" width="142" height="142" rx="7" fill="#c6cebf" />
          <rect x="34" y="34" width="124" height="124" rx="3" fill="#e2e7dc" />
          <text
            x="96"
            y="99"
            textAnchor="middle"
            fill="#53634e"
            fontSize="22"
            fontFamily="monospace"
          >
            CPU
          </text>
          <path d="M66 114h60m-48 9h36" stroke="#9aa992" strokeWidth="3" />
        </g>
      ) : kind.includes("madre") ? (
        <g transform="translate(105 35) rotate(-7 95 110)">
          <rect width="190" height="224" rx="5" fill="#3c5140" />
          <rect
            x="58"
            y="52"
            width="69"
            height="69"
            rx="4"
            stroke="#b6c6a6"
            strokeWidth="7"
          />
          <rect x="68" y="62" width="49" height="49" fill="#798c6e" />
          <path
            d="M144 30v125m16-125v125M26 153h106m-106 20h106m-106 20h106"
            stroke="#c1caa8"
            strokeWidth="7"
          />
          <rect x="12" y="15" width="24" height="92" fill="#8b9982" />
          <path d="M49 33h70M28 125h80" stroke="#8b9982" strokeWidth="8" />
        </g>
      ) : kind.includes("ram") || kind.includes("memoria") ? (
        <g transform="translate(45 90) rotate(-15 155 55)">
          <rect width="310" height="92" rx="7" fill="#314d3c" />
          <path d="M18 8h274v49H18z" fill="#657b60" />
          {[28, 95, 162, 229].map((x) => (
            <rect
              key={x}
              x={x}
              y="15"
              width="51"
              height="33"
              rx="2"
              fill="#25362b"
            />
          ))}
          <path d="M10 82h290" stroke="#cebc7e" strokeWidth="12" />
          <path d="M155 76v16" stroke="#f1f3ed" strokeWidth="5" />
          <text
            x="112"
            y="68"
            fill="#e1e9d6"
            fontSize="10"
            fontFamily="monospace"
          >
            MEMORY / DDR5
          </text>
        </g>
      ) : kind.includes("almacen") ? (
        <g transform="translate(47 97) rotate(-12 154 45)">
          <rect width="305" height="87" rx="8" fill="#3d5a44" />
          <rect x="25" y="12" width="202" height="61" rx="4" fill="#243a2d" />
          <path d="M277 14h26v58h-26" fill="#c7b97b" />
          <text
            x="46"
            y="49"
            fill="#d8e6c5"
            fontSize="22"
            fontFamily="monospace"
          >
            NVMe / SSD
          </text>
          <circle cx="10" cy="43" r="5" fill="#e0e6d8" />
        </g>
      ) : (
        <g transform="translate(98 51) rotate(-7 100 95)">
          <path d="M0 35 145 0 212 40 65 76Z" fill="#91a286" />
          <path d="m65 76 147-36v139l-147 35Z" fill="#344a38" />
          <path d="M0 35 65 76v138L0 173Z" fill="#5d7559" />
          <ellipse
            cx="136"
            cy="126"
            rx="52"
            ry="55"
            fill="#25372a"
            stroke="#9aac88"
            strokeWidth="3"
          />
          {[18, 29, 40].map((r) => (
            <ellipse
              key={r}
              cx="136"
              cy="126"
              rx={r}
              ry={r + 4}
              stroke="#607859"
              strokeWidth="2"
            />
          ))}
          <text
            x="10"
            y="122"
            fill="#e4eadc"
            fontSize="13"
            transform="rotate(32 10 122)"
          >
            PSU
          </text>
        </g>
      )}
    </svg>
  );
}
