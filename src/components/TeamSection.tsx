import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, X, Crown, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import IslamicBorder from "./IslamicBorder";
import WhatsAppIcon from "./icons/WhatsAppIcon";
import IMOIcon from "./icons/IMOIcon";
import OptimizedImage from "./ui/optimized-image";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  qualifications?: string;
  avatar_url?: string;
  board_type: string;
  order_index: number;
  whatsapp_number?: string;
  imo_number?: string;
}

const TeamSection = () => {
  const [managementTeam, setManagementTeam] = useState<TeamMember[]>([]);
  const [shariahBoard, setShariahBoard] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxImage, setLightboxImage] = useState<{ url: string; name: string } | null>(null);

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    const { data } = await supabase
      .from("team_members")
      .select("*")
      .eq("is_active", true)
      .order("order_index");
    
    if (data && data.length > 0) {
      setManagementTeam(data.filter(m => m.board_type === "management"));
      setShariahBoard(data.filter(m => m.board_type === "shariah"));
    } else {
      // Fallback to default team members
      setManagementTeam([
        { id: "1", name: "A. S. M. Al-Amin", role: "Chairman", qualifications: "Honours Islamic Studies, National University, Bangladesh", board_type: "management", order_index: 0 },
        { id: "2", name: "Mufti Mohammad Arif Hossain", role: "Director & Madina Co-ordinator", qualifications: "Imam and Khatib, Savar Thana Bus-stand Jame Masjid. Senior Muhaddith, Jamia Mahmudia Madrasha.", board_type: "management", order_index: 1 },
        { id: "3", name: "Abul Kalam", role: "Director", qualifications: "Honours Islamic Studies, National University, Bangladesh", board_type: "management", order_index: 2 },
        { id: "4", name: "Muzahidul Islam Nahid", role: "Asst. Director & Makkah Co-ordinator", qualifications: "Masters, Al-Hadith, Islamic Arabic University, Bangladesh", board_type: "management", order_index: 3 },
      ]);
      setShariahBoard([
        { id: "5", name: "Habibullah Mesbah Madani", role: "Shariah Consultant", qualifications: "Honours Islamic Law and Jurisprudence, Madina Islami University, Saudi Arabia", board_type: "shariah", order_index: 0 },
        { id: "6", name: "Anamul Hasan Sadi", role: "Consultant", qualifications: "Hafez, International Qari", board_type: "shariah", order_index: 1 },
      ]);
    }
    setLoading(false);
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  if (loading) {
    return (
      <section id="team" className="py-12 sm:py-16 lg:py-24 bg-background relative overflow-hidden">
        <div className="container">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
    <IslamicBorder>
      <section id="team" className="py-12 sm:py-16 lg:py-24 bg-background relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary/5 to-transparent rounded-full" />
      
        <div className="container relative z-10">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-6"
          >
            <span className="inline-flex items-center gap-2 text-secondary font-semibold uppercase tracking-wider">
              <Users className="w-4 h-4" />
              Meet Our Team
            </span>
          </motion.div>

          {/* Shariah Board - Now First */}
          {shariahBoard.length > 0 && (
            <>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-14"
              >
                <div className="inline-flex items-center justify-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-secondary" />
                  <Crown className="w-7 h-7 text-secondary" />
                  <Sparkles className="w-5 h-5 text-secondary" />
                </div>
                <h2 className="font-calligraphy text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-4">
                  Shariah Board
                </h2>
                <span className="font-thuluth text-secondary text-3xl md:text-4xl block mb-4">مجلس الشريعة</span>
                <div className="flex items-center justify-center gap-3 mb-6">
                  <div className="h-px w-12 sm:w-20 bg-gradient-to-r from-transparent to-secondary/60" />
                  <div className="w-2 h-2 rounded-full bg-secondary" />
                  <div className="h-px w-12 sm:w-20 bg-gradient-to-l from-transparent to-secondary/60" />
                </div>
                <p className="text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
                  Our esteemed Shariah scholars guide and ensure all our services comply with the noble principles of Islam.
                </p>
              </motion.div>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="grid md:grid-cols-2 gap-10 lg:gap-14 mb-24 max-w-7xl mx-auto"
              >
                {shariahBoard.map((member) => (
                  <motion.div
                    key={member.id}
                    variants={cardVariants}
                    whileHover={{ y: -10 }}
                    className="group relative"
                  >
                    {/* Outer gold gradient frame */}
                    <div className="absolute -inset-0.5 bg-gradient-to-br from-secondary via-secondary/40 to-secondary rounded-3xl opacity-70 group-hover:opacity-100 blur-sm group-hover:blur transition-all duration-500" />
                    
                    {/* Card */}
                    <div className="relative bg-gradient-to-br from-card via-card to-primary/5 rounded-3xl overflow-hidden shadow-elegant group-hover:shadow-2xl transition-all duration-500 flex flex-col sm:flex-row border border-secondary/20">
                      
                      {/* Decorative corner ornaments */}
                      <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-secondary/60 rounded-tl-lg pointer-events-none" />
                      <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-secondary/60 rounded-tr-lg pointer-events-none" />
                      <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-secondary/60 rounded-bl-lg pointer-events-none" />
                      <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-secondary/60 rounded-br-lg pointer-events-none" />

                      {/* Large Image Container */}
                      <div 
                        className="relative w-full sm:w-60 md:w-64 lg:w-72 h-72 sm:h-auto flex-shrink-0 overflow-hidden bg-gradient-to-br from-secondary/20 to-primary/10 cursor-pointer"
                        onClick={() => member.avatar_url && setLightboxImage({ url: member.avatar_url, name: member.name })}
                      >
                        {/* Inner gold border */}
                        <div className="absolute inset-3 sm:inset-4 border border-secondary/40 rounded-2xl pointer-events-none z-10" />
                        
                        {member.avatar_url ? (
                          <OptimizedImage 
                            src={member.avatar_url} 
                            alt={member.name}
                            className="w-full h-full transition-transform duration-700 group-hover:scale-110"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-secondary">
                            <span className="text-6xl sm:text-7xl lg:text-8xl font-heading font-bold text-secondary-foreground">
                              {getInitials(member.name)}
                            </span>
                          </div>
                        )}
                        
                        {/* Subtle gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                      </div>
                      
                      {/* Content */}
                      <div className="p-5 sm:p-6 lg:p-7 flex flex-col justify-center items-center text-center flex-1 min-w-0 relative">
                        {/* Crown accent */}
                        <Crown className="w-5 h-5 text-secondary/70 mb-3" />
                        
                        <h3 className="font-pilgrimage font-bold text-2xl sm:text-2xl lg:text-3xl xl:text-4xl text-secondary mb-3 leading-tight break-words">
                          {member.name}
                        </h3>
                        
                        <div className="flex items-center justify-center gap-2 mb-4">
                          <p className="text-foreground font-semibold text-sm sm:text-base lg:text-lg capitalize tracking-wide">
                            {member.role}
                          </p>
                        </div>
                        
                        {member.qualifications && (
                          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-4 italic">
                            {member.qualifications}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center justify-center gap-4 mt-auto">
                          {member.whatsapp_number && (
                            <a
                              href={`https://wa.me/${member.whatsapp_number.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-sm text-[#25D366] hover:text-[#128C7E] transition-all font-medium hover:scale-110"
                              title="WhatsApp"
                            >
                              <WhatsAppIcon size={20} />
                              <span className="text-xs sm:text-sm">{member.whatsapp_number}</span>
                            </a>
                          )}
                          {member.imo_number && (
                            <a
                              href={`https://imo.im/${member.imo_number.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-sm text-[#3B82F6] hover:text-[#2563EB] transition-all font-medium hover:scale-110"
                              title="IMO"
                            >
                              <IMOIcon size={20} />
                              <span className="text-xs sm:text-sm">{member.imo_number}</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </>
          )}

          {/* Management Board - Now Second */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-calligraphy text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mt-3 mb-4">
              Management Board
            </h2>
            <span className="font-thuluth text-secondary/60 text-2xl md:text-3xl block mb-6">فريقنا</span>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Our dedicated team of experienced professionals ensures your sacred journey 
              is comfortable, safe, and spiritually fulfilling.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {managementTeam.map((member) => (
              <motion.div
                key={member.id}
                variants={cardVariants}
                whileHover={{ y: -8 }}
                className="bg-gradient-to-br from-cream via-background to-gold/15 rounded-2xl shadow-elegant hover:shadow-lg transition-all duration-300 group text-center overflow-hidden border-b-4 border-secondary"
              >
                {/* Square Image Container */}
                <div 
                  className="relative aspect-square w-full overflow-hidden bg-primary cursor-pointer"
                  onClick={() => member.avatar_url && setLightboxImage({ url: member.avatar_url, name: member.name })}
                >
                  {member.avatar_url ? (
                    <OptimizedImage 
                      src={member.avatar_url} 
                      alt={member.name}
                      className="w-full h-full transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary">
                      <span className="text-7xl font-serif font-normal text-white tracking-wider">
                        {getInitials(member.name)}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Content */}
                <div className="p-5">
                  <h3 className="font-pilgrimage font-bold text-2xl text-secondary mb-1">
                    {member.name}
                  </h3>
                  <p className="text-foreground font-semibold text-sm tracking-wide mb-2 capitalize">
                    {member.role}
                  </p>
                  {member.qualifications && (
                    <p className="text-muted-foreground text-xs leading-relaxed mb-3 line-clamp-3">
                      {member.qualifications}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center justify-center gap-4">
                    {member.whatsapp_number && (
                      <a
                        href={`https://wa.me/${member.whatsapp_number.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-[#25D366] hover:text-[#128C7E] transition-colors font-medium hover:scale-110"
                        title="WhatsApp"
                      >
                        <WhatsAppIcon size={18} />
                        <span className="text-xs">{member.whatsapp_number}</span>
                      </a>
                    )}
                    {member.imo_number && (
                      <a
                        href={`https://imo.im/${member.imo_number.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-[#3B82F6] hover:text-[#2563EB] transition-colors font-medium hover:scale-110"
                        title="IMO"
                      >
                        <IMOIcon size={18} />
                        <span className="text-xs">{member.imo_number}</span>
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </IslamicBorder>

    {/* Lightbox Modal */}
    <AnimatePresence>
      {lightboxImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setLightboxImage(null)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="relative max-w-lg max-h-[80vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute -top-3 -right-3 z-10 bg-white/90 rounded-full p-1.5 shadow-lg hover:bg-white transition-colors"
            >
              <X className="w-5 h-5 text-black" />
            </button>
            <img
              src={lightboxImage.url}
              alt={lightboxImage.name}
              className="w-full h-auto max-h-[75vh] object-contain rounded-xl shadow-2xl"
            />
            <p className="text-white text-center mt-3 font-semibold text-lg">{lightboxImage.name}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
};

export default TeamSection;