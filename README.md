Modular Frontend Architecture + Separation of Concerns + Reusable Component Pattern
`
inventory/
│
├── api/                 # Shared API logic for CRUD operations
│   ├── index.js         # Generic API client / helpers ??? (I don't think its necessary)
│   ├── tiresApi.js      # Tire-specific API calls
│   ├── rimsApi.js       # Rim-specific API calls
│   ├── lightbulbsApi.js # Lightbulb-specific specific API calls
│   ├── headlightsApi.js # Headlights-specific specific API calls
│   ├── brakelinesApi.js  # Brakeline-specific API calls
│   ├── oilfiltersApi.js  # Oilfilter-specific API calls
│   └── oilsApi.js       # Oil-specific API calls
│
├── components/          # Shared React components
│   ├── Modal.jsx        # Reusable modal for editing items
│   ├── Table.jsx        # Generic table to list items
│   ├── BarChart.jsx     # Chart component
│   └── Dropdown.jsx     # Reusable dropdown
│
├── models/              # Shared DB models / Pydantic schemas
│   ├── Tire.js
│   ├── Rim.js
|   ├── LightBulb.js
|   ├── HeadLight.js
|   ├── BrakeLine.js
|   ├── OilFilter.js
│   └── Oil.js
│  
|
├── items/               # Item-specific logic & UI
│   ├── Tires/
│   │   ├── TirePage.jsx        # Page for managing tires
│   │   ├── TireEditModal.jsx    # Tire editing modal
│   │   └── TireUtils.js         # Helper functions
│   │
│   ├── Rims/
│   │   ├── RimPage.jsx
│   │   ├── RimEditModal.jsx
│   │   └── RimUtils.js
│   │
│   ├── LightBulbs/
│   │   ├── LightBulbPage.jsx
│   │   ├── LightBulbEditModal.jsx
│   │   └── LightBulbUtils.js
│   │
│   ├── HeadLights/
│   │   ├── HeadLightPage.jsx
│   │   ├── HeadLightEditModal.jsx
│   │   └── HeadLightUtils.js
│   │
│   ├── BrakeLines/
│   │   ├── BrakeLinePage.jsx
│   │   ├── BrakeLineEditModal.jsx
│   │   └── BrakeLineUtils.js
│   │
│   ├── OilFilters/
│   │   ├── OilFilterPage.jsx
│   │   ├── OilFilterEditModal.jsx
│   │   └── OilFilterUtils.js
│   │
│   └── Oils/
│       ├── OilPage.jsx
│       ├── OilEditModal.jsx
│       └── OilUtils.js
│
└── App.jsx            # Main app router and layout
`
