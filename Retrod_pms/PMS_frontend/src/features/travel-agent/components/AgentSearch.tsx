import { useState } from "react";
import { Search, MapPin, Calendar as CalendarIcon, Users, Building, ArrowRight, Info, Plus, Minus, Check, Star } from "lucide-react";
import { Card, CardHeader, Button, StatusBadge } from "@/components/ui/Primitives";
import { Link } from "@tanstack/react-router";

// Mock data for the search results
const searchResults = [
  {
    id: "h1",
    name: "The Grand Palace",
    location: "New Delhi",
    address: "123 Heritage Marg, Connaught Place, New Delhi",
    stars: 5,
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800",
    description: "A luxurious 5-star property blending classic heritage with modern amenities. Perfect for both business and leisure travelers. Features 3 award-winning restaurants, a full-service spa, and an infinity pool overlooking the city skyline.",
    amenities: ["Free WiFi", "Infinity Pool", "Spa & Wellness", "3 Restaurants"],
    rooms: [
      {
        id: "r1",
        name: "Deluxe King Room",
        description: "Spacious 45sqm room with city views, kingsize bed, and premium amenities.",
        image: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&q=80&w=600",
        capacity: "Max 3 guests",
        features: ["City View", "Bathtub"],
        roomsLeft: 2,
        rates: [
          { plan: "Room Only (B2B Standard)", cancellation: "Free cancellation", retail: "₹8,500", net: "₹7,225", commissionPercent: "15%", commissionAmount: "₹1,275" },
          { plan: "Bed & Breakfast (B2B Flex)", cancellation: "Free cancellation", retail: "₹9,500", net: "₹8,075", commissionPercent: "15%", commissionAmount: "₹1,425" }
        ]
      },
      {
        id: "r2",
        name: "Executive Suite",
        description: "Luxurious 65sqm suite with separate living area, lounge access, and premium views.",
        image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=600",
        capacity: "Max 4 guests",
        features: ["Lounge Access", "Living Room"],
        roomsLeft: 1,
        rates: [
          { plan: "Bed & Breakfast (B2B Standard)", cancellation: "Non-refundable", retail: "₹14,500", net: "₹11,600", commissionPercent: "20%", commissionAmount: "₹2,900" }
        ]
      }
    ]
  },
  {
    id: "h2",
    name: "City Center Inn",
    location: "Mumbai",
    address: "45 Business District, Andheri East, Mumbai",
    stars: 4,
    image: "https://images.unsplash.com/photo-1551882547-ff40c0dffe19?auto=format&fit=crop&q=80&w=800",
    description: "Modern, chic, and perfectly located for corporate travelers. Features high-speed internet across the property, 24/7 business center, and a multi-cuisine dining experience.",
    amenities: ["Free WiFi", "Business Center", "Gym", "Restaurant"],
    rooms: [
      {
        id: "r3",
        name: "Standard Corporate Room",
        description: "Efficient 30sqm room designed for the business traveler with an ergonomic workspace.",
        image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=600",
        capacity: "Max 2 guests",
        features: ["Work Desk", "Express Check-in"],
        roomsLeft: 8,
        rates: [
          { plan: "Corporate Room Only", cancellation: "Free up to 24hr", retail: "₹6,000", net: "₹5,100", commissionPercent: "15%", commissionAmount: "₹900" },
          { plan: "Corporate B&B", cancellation: "Free up to 24hr", retail: "₹6,800", net: "₹5,780", commissionPercent: "15%", commissionAmount: "₹1,020" }
        ]
      }
    ]
  }
];

export function AgentSearch() {
  const [hasSearched, setHasSearched] = useState(false);
  const [guestsPopoverOpen, setGuestsPopoverOpen] = useState(false);
  const [searchRoomsCount, setSearchRoomsCount] = useState(1);
  const [adultsCount, setAdultsCount] = useState(2);
  const [childrenCount, setChildrenCount] = useState(0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-xl font-bold text-text-primary">Hotel Search & Booking</h2>
        <p className="text-[13px] text-text-secondary mt-1">Search live inventory, view hotel profiles, and book rooms at exclusive B2B rates.</p>
      </div>

      <Card>
        <div className="p-5">
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 md:items-end gap-4">
            <div className="space-y-1.5 md:col-span-1">
              <label className="text-[12px] font-medium text-text-primary">Destination or Hotel</label>
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
                <select className="h-10 w-full rounded-md border border-border bg-surface pl-9 pr-3 text-[13px] text-text-primary focus:border-brand focus:outline-none">
                  <option>All Locations</option>
                  <option>New Delhi</option>
                  <option>Mumbai</option>
                  <option>Goa</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5 md:col-span-1">
              <label className="text-[12px] font-medium text-text-primary">Check-in - Check-out</label>
              <div className="relative">
                <CalendarIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
                <input 
                  type="text" 
                  defaultValue="24 May 2026 - 27 May 2026"
                  className="h-10 w-full rounded-md border border-border bg-surface pl-9 pr-3 text-[13px] text-text-primary focus:border-brand focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5 md:col-span-1 relative">
              <label className="text-[12px] font-medium text-text-primary">Guests & Rooms</label>
              <div 
                className="relative h-10 w-full rounded-md border border-border bg-surface flex items-center pl-9 pr-3 text-[13px] text-text-primary cursor-pointer hover:border-brand"
                onClick={() => setGuestsPopoverOpen(!guestsPopoverOpen)}
              >
                <Users className="absolute left-3 h-4 w-4 text-text-secondary" />
                <span className="truncate">{adultsCount} Adult{adultsCount !== 1 ? 's' : ''}, {childrenCount} Child{childrenCount !== 1 ? 'ren' : ''}, {searchRoomsCount} Room{searchRoomsCount !== 1 ? 's' : ''}</span>
              </div>
              
              {guestsPopoverOpen && (
                <div className="absolute top-full left-0 mt-1 w-72 rounded-xl border border-border bg-surface p-4 shadow-lg z-50">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[13px] font-medium text-text-primary">Rooms</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button type="button" onClick={() => setSearchRoomsCount(Math.max(1, searchRoomsCount - 1))} className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-text-secondary hover:bg-surface-2"><Minus className="h-3 w-3" /></button>
                        <span className="w-4 text-center text-[13px] font-medium">{searchRoomsCount}</span>
                        <button type="button" onClick={() => setSearchRoomsCount(searchRoomsCount + 1)} className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-text-secondary hover:bg-surface-2"><Plus className="h-3 w-3" /></button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[13px] font-medium text-text-primary">Adults</div>
                        <div className="text-[11px] text-text-secondary">Ages 13 or above</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button type="button" onClick={() => setAdultsCount(Math.max(1, adultsCount - 1))} className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-text-secondary hover:bg-surface-2"><Minus className="h-3 w-3" /></button>
                        <span className="w-4 text-center text-[13px] font-medium">{adultsCount}</span>
                        <button type="button" onClick={() => setAdultsCount(adultsCount + 1)} className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-text-secondary hover:bg-surface-2"><Plus className="h-3 w-3" /></button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[13px] font-medium text-text-primary">Children</div>
                        <div className="text-[11px] text-text-secondary">Ages 0-12</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button type="button" onClick={() => setChildrenCount(Math.max(0, childrenCount - 1))} className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-text-secondary hover:bg-surface-2"><Minus className="h-3 w-3" /></button>
                        <span className="w-4 text-center text-[13px] font-medium">{childrenCount}</span>
                        <button type="button" onClick={() => setChildrenCount(childrenCount + 1)} className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-text-secondary hover:bg-surface-2"><Plus className="h-3 w-3" /></button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 flex justify-end border-t border-border pt-3">
                    <Button type="button" variant="primary" size="sm" onClick={() => setGuestsPopoverOpen(false)}>Apply</Button>
                  </div>
                </div>
              )}
            </div>

            <div className="md:col-span-1">
              <Button type="submit" variant="primary" className="w-full h-10 justify-center">
                <Search className="h-4 w-4 mr-2" /> Search Inventory
              </Button>
            </div>
          </form>
        </div>
      </Card>

      {hasSearched && (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-[16px] font-semibold text-text-primary">Showing {searchResults.length} Properties</h3>
            <div className="text-[12px] text-text-secondary">Rates are Net B2B</div>
          </div>

          {searchResults.map((hotel) => (
            <div key={hotel.id} className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm flex flex-col">
              
              {/* Hotel Profile Section */}
              <div className="flex flex-col md:flex-row border-b border-border">
                <div className="w-full md:w-1/3 h-48 md:h-auto shrink-0">
                   <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                   <div>
                     <div className="flex justify-between items-start">
                       <div>
                         <h3 className="text-xl font-bold text-text-primary">{hotel.name}</h3>
                         <div className="flex items-center text-text-secondary mt-1 text-[13px]">
                           <MapPin className="h-4 w-4 mr-1" /> {hotel.address}
                         </div>
                       </div>
                       <div className="flex gap-1 text-warning">
                         {[...Array(hotel.stars)].map((_, i) => (
                           <Star key={i} className="h-4 w-4 fill-current" />
                         ))}
                       </div>
                     </div>
                     <p className="mt-4 text-[13px] text-text-secondary leading-relaxed">
                       {hotel.description}
                     </p>
                     <div className="mt-4 flex flex-wrap gap-2">
                        {hotel.amenities.map(amenity => (
                          <StatusBadge key={amenity} tone="neutral" className="text-[11px]">{amenity}</StatusBadge>
                        ))}
                     </div>
                   </div>
                </div>
              </div>

              {/* Room Plans Section */}
              <div className="bg-surface-2/10 p-6">
                <h4 className="text-[14px] font-semibold text-text-primary mb-4 flex items-center gap-2">
                  <Building className="h-4 w-4 text-brand" /> Available Room Options
                </h4>
                
                <div className="space-y-4">
                  {hotel.rooms.map(room => (
                    <div key={room.id} className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
                      <div className="flex flex-col md:flex-row">
                        <div className="md:w-[250px] border-b md:border-b-0 md:border-r border-border bg-surface-2/30 flex flex-col shrink-0">
                          <div className="h-28 w-full relative">
                            <img src={room.image} alt={room.name} className="w-full h-full object-cover" />
                            <div className="absolute top-2 left-2 flex gap-1">
                               <StatusBadge tone="info" className="bg-white/90 shadow-sm border-none backdrop-blur-sm text-[10px]">{room.capacity}</StatusBadge>
                            </div>
                          </div>
                          <div className="p-4 flex-1">
                            <div className="flex justify-between items-start gap-2">
                              <h4 className="text-[13px] font-bold text-text-primary">{room.name}</h4>
                              {room.roomsLeft && room.roomsLeft <= 3 ? (
                                <span className="text-[10px] font-medium text-error bg-error/10 px-1.5 py-0.5 rounded whitespace-nowrap">
                                  Only {room.roomsLeft} left!
                                </span>
                              ) : (
                                <span className="text-[10px] font-medium text-success bg-success/10 px-1.5 py-0.5 rounded whitespace-nowrap">
                                  {room.roomsLeft} available
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-[11px] text-text-secondary line-clamp-2">{room.description}</p>
                            <div className="mt-2 flex flex-wrap gap-1">
                              {room.features.map(f => (
                                <span key={f} className="text-[10px] bg-border/50 px-2 py-0.5 rounded text-text-secondary">{f}</span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex-1 p-0 overflow-x-auto">
                          <table className="w-full text-left text-[12px] min-w-[500px]">
                            <thead className="bg-surface-2/50 text-[10px] uppercase tracking-wider text-text-secondary">
                              <tr>
                                <th className="p-3 font-medium">Rate Plan</th>
                                <th className="p-3 font-medium">Cancellation</th>
                                <th className="p-3 font-medium text-right">Selling Rate</th>
                                <th className="p-3 font-medium text-right">Agent Net</th>
                                <th className="p-3 font-medium text-right">Commission</th>
                                <th className="p-3 text-center">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border-subtle">
                              {room.rates.map((rate, i) => (
                                <tr key={i} className="hover:bg-surface-2/30 transition-colors">
                                  <td className="p-3">
                                    <div className="font-medium text-text-primary">{rate.plan}</div>
                                  </td>
                                  <td className={`p-3 flex items-center gap-1 ${rate.cancellation.includes('Free') ? 'text-success' : 'text-error'}`}>
                                    {rate.cancellation.includes('Free') ? <Check className="h-3 w-3" /> : <Info className="h-3 w-3" />} 
                                    {rate.cancellation}
                                  </td>
                                  <td className="p-3 text-right text-text-secondary line-through">{rate.retail}</td>
                                  <td className="p-3 text-right">
                                    <div className="font-bold text-brand text-[14px]">{rate.net}</div>
                                    <div className="text-[10px] text-text-secondary">per night</div>
                                  </td>
                                  <td className="p-3 text-right">
                                    <div className="font-medium text-success">{rate.commissionPercent}</div>
                                    <div className="text-[10px] text-text-secondary">{rate.commissionAmount}</div>
                                  </td>
                                  <td className="p-3 text-center">
                                    <Link to="/travel-agent/book">
                                      <Button variant="primary" size="sm" className="w-full justify-center">Book</Button>
                                    </Link>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
