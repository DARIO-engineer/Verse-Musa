import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useResponsive } from '../../hooks/useResponsive';
import ResponsiveUtils from '../../utils/ResponsiveUtils';

interface ResponsiveGridProps {
  children: React.ReactNode[];
  spacing?: number;
  minItemWidth?: number;
  maxColumns?: number;
  style?: ViewStyle;
}

const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  spacing = 16,
  minItemWidth = 150,
  maxColumns = 4,
  style,
}) => {
  const responsive = useResponsive();

  // Calcular número de colunas baseado na largura da tela e largura mínima do item
  const calculateColumns = (): number => {
    const availableWidth = responsive.width - (spacing * 2);
    const possibleColumns = Math.floor(availableWidth / (minItemWidth + spacing));
    return Math.min(Math.max(1, possibleColumns), maxColumns);
  };

  const columns = calculateColumns();
  const itemWidth = ResponsiveUtils.getItemWidth(columns, spacing);

  const renderRows = () => {
    const rows: React.ReactNode[][] = [];
    for (let i = 0; i < children.length; i += columns) {
      rows.push(children.slice(i, i + columns));
    }
    return rows;
  };

  const containerStyle: ViewStyle = {
    padding: spacing,
    ...style,
  };

  const rowStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing,
  };

  const itemStyle: ViewStyle = {
    width: itemWidth,
  };

  return (
    <View style={containerStyle}>
      {renderRows().map((row, rowIndex) => (
        <View key={rowIndex} style={rowStyle}>
          {row.map((child, itemIndex) => (
            <View key={itemIndex} style={itemStyle}>
              {child}
            </View>
          ))}
          {/* Preencher espaços vazios na última linha */}
          {row.length < columns &&
            Array.from({ length: columns - row.length }).map((_, emptyIndex) => (
              <View key={`empty-${emptyIndex}`} style={itemStyle} />
            ))}
        </View>
      ))}
    </View>
  );
};

export default ResponsiveGrid;
