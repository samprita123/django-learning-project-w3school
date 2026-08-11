import re
with open('src/features/settings/components/RoomsFeature.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('bg-surface-2 relative sticky top-0 shrink-0', 'bg-surface-2 relative shrink-0')

old_amenities = '''                {(() => {
                  const selectedPropObj = properties.find(p => p.id === selectedProperty);
                  const hotelAmenities = selectedPropObj?.amenities || [];
                  const filteredAmenities = dbAmenities.filter(amenity => hotelAmenities.includes(amenity.code));

                  if (filteredAmenities.length === 0) {
                    return <p className=\
text-xs
text-text-secondary
col-span-2\>No amenities configured for the selected hotel.</p>;
                  }

                  return filteredAmenities.map(amenity => ('''

new_amenities = '''                {(() => {
                  if (dbAmenities.length === 0) {
                    return <p className=\text-xs
text-text-secondary
col-span-2\>No amenities available in the database.</p>;
                  }

                  return dbAmenities.map(amenity => ('''

if old_amenities in text:
    text = text.replace(old_amenities, new_amenities)
else:
    print('Failed to match amenities block!')

with open('src/features/settings/components/RoomsFeature.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

