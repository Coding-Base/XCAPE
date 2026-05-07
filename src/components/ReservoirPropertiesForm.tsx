import React, { useState } from 'react';
import { AlertCircle, Check } from 'lucide-react';

interface ReservoirProperties {
  rock_properties?: {
    porosity?: number | string;
    permeability?: number | string;
    depth?: number | string;
    temperature?: number | string;
  };
  fluid_properties?: {
    initial_pressure?: number | string;
    water_saturation?: number | string;
    oil_density?: number | string;
    gas_density?: number | string;
  };
}

interface ReservoirPropertiesFormProps {
  initialData?: ReservoirProperties;
  onDataChange: (data: ReservoirProperties) => void;
}

export const ReservoirPropertiesForm: React.FC<ReservoirPropertiesFormProps> = ({
  initialData,
  onDataChange,
}) => {
  const [data, setData] = useState<ReservoirProperties>(
    initialData || {
      rock_properties: {
        porosity: '',
        permeability: '',
        depth: '',
        temperature: '',
      },
      fluid_properties: {
        initial_pressure: '',
        water_saturation: '',
        oil_density: '',
        gas_density: '',
      },
    }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = (path: string, value: string | number): boolean => {
    if (value === '' || value === null) {
      return false; // Allow empty for optional fields
    }

    if (isNaN(Number(value))) {
      return false;
    }

    // Validate ranges for known fields
    const numValue = Number(value);
    const fieldName = path.split('.').pop() || '';

    if (
      ['porosity', 'water_saturation'].includes(fieldName) &&
      (numValue < 0 || numValue > 100)
    ) {
      return false;
    }

    if (fieldName === 'permeability' && numValue < 0) {
      return false;
    }

    return true;
  };

  const handleChange = (path: string, value: string) => {
    const parts = path.split('.');
    setData((prev) => {
      const newData = { ...prev };
      let current: any = newData;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) {
          current[parts[i]] = {};
        }
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]] = value;
      return newData;
    });

    // Clear error if valid
    if (validateField(path, value)) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[path];
        return newErrors;
      });
    } else if (value !== '') {
      setErrors((prev) => ({
        ...prev,
        [path]: 'Invalid value',
      }));
    } else {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[path];
        return newErrors;
      });
    }

    onDataChange(data);
  };

  const getFieldValue = (path: string): string => {
    const parts = path.split('.');
    let current: any = data;
    for (const part of parts) {
      current = current?.[part];
    }
    return current?.toString() || '';
  };

  const hasAtLeastOneField = (): boolean => {
    const requiredFields = [
      'rock_properties.porosity',
      'rock_properties.permeability',
      'fluid_properties.initial_pressure',
      'fluid_properties.water_saturation',
    ];

    return requiredFields.some((field) => {
      const value = getFieldValue(field);
      return value !== '';
    });
  };

  const isValid = hasAtLeastOneField() && Object.keys(errors).length === 0;

  return (
    <div className="w-full space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded p-3 flex items-start gap-2 dark:bg-slate-800 dark:border-slate-700">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-700 dark:text-blue-200">
          Enter reservoir model properties. At least one field must be filled. All numeric values
          must be valid numbers.
        </p>
      </div>

      {/* Rock Properties Section */}
      <div className="border border-gray-200 rounded p-4 space-y-4 dark:border-slate-700 dark:bg-slate-800">
        <h3 className="font-semibold text-gray-900 text-sm dark:text-slate-100">Rock Properties</h3>

        <div className="grid grid-cols-2 gap-4">
          {/* Porosity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-slate-300">
              Porosity (%)
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={getFieldValue('rock_properties.porosity')}
              onChange={(e) => handleChange('rock_properties.porosity', e.target.value)}
              placeholder="0-100"
              className={`w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 ${
                errors['rock_properties.porosity']
                  ? 'border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900 dark:text-red-300'
                  : 'border-gray-300 focus:ring-blue-500 dark:border-slate-600 dark:bg-transparent dark:text-slate-100'
              }`}
            />
            {errors['rock_properties.porosity'] && (
              <p className="text-xs text-red-600 mt-1">{errors['rock_properties.porosity']}</p>
            )}
          </div>

          {/* Permeability */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-slate-300">
              Permeability (mD)
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={getFieldValue('rock_properties.permeability')}
              onChange={(e) => handleChange('rock_properties.permeability', e.target.value)}
              placeholder="e.g., 100"
              className={`w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 ${
                errors['rock_properties.permeability']
                  ? 'border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900 dark:text-red-300'
                  : 'border-gray-300 focus:ring-blue-500 dark:border-slate-600 dark:bg-transparent dark:text-slate-100'
              }`}
            />
            {errors['rock_properties.permeability'] && (
              <p className="text-xs text-red-600 mt-1">{errors['rock_properties.permeability']}</p>
            )}
          </div>

          {/* Depth */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-slate-300">
              Depth (ft)
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={getFieldValue('rock_properties.depth')}
              onChange={(e) => handleChange('rock_properties.depth', e.target.value)}
              placeholder="e.g., 10000"
              className={`w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 ${
                errors['rock_properties.depth']
                  ? 'border-red-500 focus:ring-red-500 bg-red-50'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
            {errors['rock_properties.depth'] && (
              <p className="text-xs text-red-600 mt-1">{errors['rock_properties.depth']}</p>
            )}
          </div>

          {/* Temperature */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-slate-300">
              Temperature (°F)
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={getFieldValue('rock_properties.temperature')}
              onChange={(e) => handleChange('rock_properties.temperature', e.target.value)}
              placeholder="e.g., 150"
              className={`w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 ${
                errors['rock_properties.temperature']
                  ? 'border-red-500 focus:ring-red-500 bg-red-50'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
            {errors['rock_properties.temperature'] && (
              <p className="text-xs text-red-600 mt-1">{errors['rock_properties.temperature']}</p>
            )}
          </div>
        </div>
      </div>

      {/* Fluid Properties Section */}
      <div className="border border-gray-200 rounded p-4 space-y-4 dark:border-slate-700 dark:bg-slate-800">
        <h3 className="font-semibold text-gray-900 text-sm dark:text-slate-100">Fluid Properties</h3>

        <div className="grid grid-cols-2 gap-4">
          {/* Initial Pressure */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-slate-300">
              Initial Pressure (bar)
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={getFieldValue('fluid_properties.initial_pressure')}
              onChange={(e) => handleChange('fluid_properties.initial_pressure', e.target.value)}
              placeholder="e.g., 250"
              className={`w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 ${
                errors['fluid_properties.initial_pressure']
                  ? 'border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900 dark:text-red-300'
                  : 'border-gray-300 focus:ring-blue-500 dark:border-slate-600 dark:bg-transparent dark:text-slate-100'
              }`}
            />
            {errors['fluid_properties.initial_pressure'] && (
              <p className="text-xs text-red-600 mt-1">
                {errors['fluid_properties.initial_pressure']}
              </p>
            )}
          </div>

          {/* Water Saturation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-slate-300">
              Water Saturation (%)
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={getFieldValue('fluid_properties.water_saturation')}
              onChange={(e) =>
                handleChange('fluid_properties.water_saturation', e.target.value)
              }
              placeholder="0-100"
              className={`w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 ${
                errors['fluid_properties.water_saturation']
                  ? 'border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900 dark:text-red-300'
                  : 'border-gray-300 focus:ring-blue-500 dark:border-slate-600 dark:bg-transparent dark:text-slate-100'
              }`}
            />
            {errors['fluid_properties.water_saturation'] && (
              <p className="text-xs text-red-600 mt-1">
                {errors['fluid_properties.water_saturation']}
              </p>
            )}
          </div>

          {/* Oil Density */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-slate-300">
              Oil Density (lb/bbl)
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={getFieldValue('fluid_properties.oil_density')}
              onChange={(e) => handleChange('fluid_properties.oil_density', e.target.value)}
              placeholder="e.g., 45"
              className={`w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 ${
                errors['fluid_properties.oil_density']
                  ? 'border-red-500 focus:ring-red-500 bg-red-50'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
            {errors['fluid_properties.oil_density'] && (
              <p className="text-xs text-red-600 mt-1">
                {errors['fluid_properties.oil_density']}
              </p>
            )}
          </div>

          {/* Gas Density */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-slate-300">
              Gas Density (lb/scf)
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={getFieldValue('fluid_properties.gas_density')}
              onChange={(e) => handleChange('fluid_properties.gas_density', e.target.value)}
              placeholder="e.g., 0.065"
              className={`w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 ${
                errors['fluid_properties.gas_density']
                  ? 'border-red-500 focus:ring-red-500 bg-red-50'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
            {errors['fluid_properties.gas_density'] && (
              <p className="text-xs text-red-600 mt-1">
                {errors['fluid_properties.gas_density']}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Validation Status */}
      <div className="flex items-center gap-2">
        {isValid ? (
          <div className="inline-flex items-center gap-2 text-green-700 bg-green-50 px-3 py-2 rounded border border-green-200 dark:bg-slate-800 dark:border-slate-700 dark:text-green-300">
            <Check className="w-4 h-4" />
            <span className="text-sm font-medium">Data valid</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-2 rounded border border-gray-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Fill at least one field</span>
          </div>
        )}
      </div>
    </div>
  );
};
